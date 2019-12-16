<?php
/**
 * Sets the theme functions
 *
 * @package KiliStarted
 */

// Load the parent theme.
if ( !isset($kili_framework) || $kili_framework == null ) {
	include get_template_directory() . '/config/load.php';
}

// Autoload KiliStarted Includes.
	foreach ( glob( __DIR__ . '/inc/*.php' ) as $module ) {
	if ( ! $modulepath = $module ) {
		trigger_error( sprintf( __( 'Error locating %s for inclusion', 'kili-started' ), $module ), E_USER_ERROR );
	}
	require_once( $modulepath );
	}

unset( $module, $filepath );


if ( ! class_exists( 'KiliStarted' ) ) {
	/**
	* Child theme main Class
	*/
	class KiliStarted {
		/**
		 * Class constructor
		 */
		function __construct() {
			$this->theme_setup();
			$this->add_actions();
			$this->add_filters();
		}

		/**
		 * Theme setup
		 *
		 * @return void
		 */
		public function theme_setup() {
			global $kili_framework;

			if ( isset($kili_framework) || $kili_framework != null ) {
				if ( class_exists( 'Timber' ) ) {
					$new_twig_path = array(
						'blocks/assets/styles',
						'blocks/assets/scripts'
					);
					Timber::$dirname = array_merge( Timber::$dirname, $new_twig_path );
				}
				$kili_framework->render_pages();
			}

			register_nav_menus( array(
				'header_navigation'	=> __( 'Header Navigation', 'kili-started' )
			) );

			add_theme_support( 'kili-nice-search' );
			add_theme_support( 'post-thumbnails', array( 'post' ) );
			remove_image_size('large');
			remove_image_size('medium');
			remove_image_size('thumbnail');
		}

		/**
		 * Add actions to theme
		 *
		 * @return void
		 */
		public function add_actions() {
			if ( is_admin() ) {
				add_action( 'acf/init', array( $this, 'add_theme_options_page' ) );
				add_action( 'admin_enqueue_scripts', array( $this, 'load_admin_assets' ) );
				add_action('acf/save_post', array( $this,'clear_options_main_transient'), 20);
			} else {
				add_action( 'wp_enqueue_scripts', array( $this, 'load_assets' ) );
			}
		}

		/**
		 * Add filters to theme
		 *
		 * @return void
		 */
		public function add_filters() {
			add_filter( 'timber_context', array( $this, 'theme_context' ) );
		}

		/**
		 * Options for using in page context
		 *
		 * @param array $context The timber context.
		 * @return array Theme options array
		 */
	    public function theme_context( $context ) {
			$context['menu']['header']	= $this->get_kili_transient_object('header_navigation', 1, 'header_navigation', 31557600);
			$context['options']			= $this->get_kili_transient_object('site_options', 0, 'option', 31557600);

			if ( class_exists( 'WPSEO_Meta' )  ) {
				$context['wpseo_metadesc'] = WPSEO_Meta::get_value( "metadesc" );
			}

			return $context;
		}

		function clear_options_main_transient() {
			$screen = get_current_screen();
			if ( strpos($screen->id, "kili-theme-settings") == true ) {
				delete_transient('kili_header_navigation');
				delete_transient('kili_site_options');

				$this->get_kili_transient_object('header_navigation', 1, 'header_navigation', 31557600);
				$this->get_kili_transient_object('site_options', 0, 'option', 31557600);
			}
		}

		/**
		 * Load assets for admin
		 *
		 * @return void
		 */
		public function load_admin_assets() {
			global $kili_framework;
			wp_enqueue_style( 'admin_css', $this->asset_path( 'styles/admin.css' ), false, null );
		}

		/**
		 * Load theme assets
		 *
		 * @return void
		 */
		public function load_assets() {

			if ( ( is_archive() || is_author() || is_category() || is_home() || is_single() || is_tag() || is_search())
                && 'post' === get_post_type() ) {
				wp_enqueue_style( 'theme-style', $this->asset_path( 'styles/blog.css' ), false, null );
			} else {
				wp_enqueue_style( 'theme-style', $this->asset_path( 'styles/main.css' ), false, null );
			}
			wp_enqueue_script( 'theme-scripts', $this->asset_path('scripts/main.js'), ['jquery'], null, true );
		}

		/**
		 * Add Kili theme options page
		 *
		 * @return void
		 */
		public function add_theme_options_page() {
			if( function_exists('acf_add_options_page') ) {
				$option_page = acf_add_options_page(
					array(
						'page_title' => __('Theme Settings', 'kili-started'),
						'menu_title' => __('Theme Settings', 'kili-started'),
						'menu_slug' => 'kili-theme-settings',
						'position' => 58.996,
						'icon_url' => 'dashicons-kili',
						'capability' => 'manage_options',
					)
				);
			}
		}

		/**
		 * Add Kili context to transient
		 *
		 * @return object
		 */
		public function get_kili_transient_object($name, $type = 0, $slug = 'option', $time = 3600) {
            $transient_key = __CLASS__ . '_' . $name;
            $transient_object = get_transient( $transient_key );
            if ( ! empty( $transient_object ) ) {
                return $transient_object;
            }
            if ($type == 1) {
            	$object = class_exists( 'TimberMenu' ) ? new TimberMenu( $slug ) : '';
            } else {
            	$object = function_exists( 'get_fields' ) ? get_fields( $slug ) : '';
            }
			set_transient( $transient_key, $object, $time );
            return $object;
		}

		/**
		 * Get kili assets path
		 *
		 * @return string
		 */
		public function asset_path( $filename ) {
			$dist_path = get_stylesheet_directory_uri() . '/dist/';
			static $manifest;

			if (empty($manifest)) {
				$manifest_path = get_stylesheet_directory() . '/dist/' . 'assets.json';
				$manifest = new kiliAssets($manifest_path);
			}

			if (array_key_exists($filename, $manifest->get())) {
				return $dist_path . $manifest->get()[$filename];
			}
			return $dist_path . $filename;
		}

	}
}

// Start the main class.
$kili_started_kili_class = new KiliStarted();
