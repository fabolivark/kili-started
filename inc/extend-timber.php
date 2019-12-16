<?php
if ( class_exists( 'TimberSite' ) ) {
	class KiliStartedSite extends TimberSite {
		function __construct() {
			add_filter( 'get_twig', array( $this, 'add_to_twig' ) );
			parent::__construct();
		}

		function add_to_twig( $twig ) {

			$function = new Twig_SimpleFunction('get_assets_path', function ( $filename ) {
				return $this->assets_path( $filename );
			});
			$twig->addFunction($function);

			return $twig;
		}

		private function assets_path( $filename ) {
			$dist_path = get_stylesheet_directory_uri() . '/dist/';
			static $manifest;

			if (empty($manifest)) {
				$manifest_path = get_stylesheet_directory() . '/dist/' . 'assets.json';
				$manifest = new payixAssets($manifest_path);
			}

			if (array_key_exists($filename, $manifest->get())) {
				return $dist_path . $manifest->get()[$filename];
			}
			return $dist_path . $filename;
		}
	}
	new KiliStartedSite();
}
