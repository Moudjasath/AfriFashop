<?php

namespace App\Command;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:seed-products', description: 'Seed the database with real African fashion products')]
class SeedProductsCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('force', 'f', InputOption::VALUE_NONE, 'Truncate existing products before seeding');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if ($input->getOption('force')) {
            $this->em->getConnection()->executeStatement('TRUNCATE TABLE product RESTART IDENTITY CASCADE');
            $io->note('Table product vidée.');
        } else {
            $existing = $this->em->getRepository(Product::class)->count([]);
            if ($existing > 0) {
                $io->warning("Database already has $existing product(s). Use --force to re-seed.");
                return Command::SUCCESS;
            }
        }

        // Images: Unsplash (free, high-quality fashion & accessories photos)
        $IMG = 'https://images.unsplash.com/photo-';
        $Q   = '?auto=format&fit=crop&w=600&h=750&q=80';

        $products = [
            // ── ROBES ──────────────────────────────────────────────────────────
            [
                'name'        => 'Robe Ankara Festive',
                'description' => 'Robe majestueuse en imprimé Ankara aux couleurs éclatantes. Coupe trapèze avec col en V et manches courtes évasées. Confectionnée à la main par des artisanes du Bénin à partir de tissu wax 100 % coton. Idéale pour les cérémonies, mariages et événements culturels.',
                'price'       => 89.00, 'oldPrice' => 120.00, 'category' => 'Dresses',
                'image'       => $IMG.'1590736704728-f4730bb30770'.$Q,
                'badge' => 'Nouveau', 'rating' => 4.8, 'reviewCount' => 124, 'stock' => 15,
                'colors' => ['#C0392B', '#E67E22', '#2ECC71'],
                'sizes'  => ['XS', 'S', 'M', 'L', 'XL'],
            ],
            [
                'name'        => 'Robe Maxi Wax Dorée',
                'description' => 'Longue robe fluide en wax imprimé aux motifs géométriques dorés. Col rond, fentes latérales et taille empire mise en valeur par une ceinture tissée assortie. Tissu léger et respirant, parfait pour l\'été et les soirées d\'été africaines.',
                'price'       => 95.00, 'oldPrice' => null, 'category' => 'Dresses',
                'image'       => $IMG.'1515886657613-9f3515b0c78f'.$Q,
                'badge' => 'Nouveau', 'rating' => 4.6, 'reviewCount' => 92, 'stock' => 18,
                'colors' => ['#FF6B35', '#004E89', '#1A936F'],
                'sizes'  => ['XS', 'S', 'M', 'L', 'XL'],
            ],
            [
                'name'        => 'Robe Bogolan Chic',
                'description' => 'Robe midi inspirée du Bogolan (tissu boue) malien avec des motifs géométriques peints à la main. Chaque pièce est unique. La teinture naturelle aux extraits de plantes donne des teintes terreuses profondes. Fermeture dos zippée et ceinture incluse.',
                'price'       => 112.00, 'oldPrice' => 145.00, 'category' => 'Dresses',
                'image'       => $IMG.'1539109136881-3be0616acf4b'.$Q,
                'badge' => 'Vente', 'rating' => 4.5, 'reviewCount' => 43, 'stock' => 12,
                'colors' => ['#795548', '#5D4037', '#3E2723'],
                'sizes'  => ['XS', 'S', 'M', 'L'],
            ],
            [
                'name'        => 'Robe Kente Wrap',
                'description' => 'Robe portefeuille en tissu Kente aux bandes multicolores emblématiques du Ghana. La coupe portefeuille met en valeur toutes les silhouettes. Broderies dorées sur les manchettes et l\'encolure. Tissu tramé main par des tisserands ashanti.',
                'price'       => 135.00, 'oldPrice' => 175.00, 'category' => 'Dresses',
                'image'       => $IMG.'1594938298603-c8148c4b4357'.$Q,
                'badge' => 'Vente', 'rating' => 4.9, 'reviewCount' => 68, 'stock' => 7,
                'colors' => ['#D4A017', '#8E1A0E', '#1A4D2E'],
                'sizes'  => ['S', 'M', 'L', 'XL'],
            ],
            // ── HAUTS ──────────────────────────────────────────────────────────
            [
                'name'        => 'Haut Dashiki Brodé',
                'description' => 'Haut Dashiki classique avec broderies artisanales au col et aux manches. Tissu wax 100 % coton dans des tons chauds et vibrants. Coupe ample pour un confort optimal, adapté à une tenue décontractée ou semi-formelle. Fabriqué au Ghana.',
                'price'       => 55.00, 'oldPrice' => 70.00, 'category' => 'Tops',
                'image'       => $IMG.'1529720317453-c8da503f2051'.$Q,
                'badge' => 'Vente', 'rating' => 4.7, 'reviewCount' => 156, 'stock' => 22,
                'colors' => ['#E74C3C', '#F39C12', '#27AE60'],
                'sizes'  => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            ],
            [
                'name'        => 'Blouse Wax Asymétrique',
                'description' => 'Blouse moderne à ourlet asymétrique en tissu wax imprimé floral. Manches longues froncées avec poignets boutonnés. Coupe cintrée légèrement oversize pour une allure contemporaine. Entretien facile, lavable en machine à 30°C.',
                'price'       => 62.00, 'oldPrice' => null, 'category' => 'Tops',
                'image'       => $IMG.'1509631179647-0177331693ae'.$Q,
                'badge' => null, 'rating' => 4.4, 'reviewCount' => 38, 'stock' => 25,
                'colors' => ['#9B59B6', '#3498DB', '#E67E22'],
                'sizes'  => ['XS', 'S', 'M', 'L', 'XL'],
            ],
            [
                'name'        => 'Chemise Batik Artisanale',
                'description' => 'Chemise ample en batik artisanal teint à la main selon une technique ancestrale d\'Afrique de l\'Ouest. Chaque pièce présente des variations de motifs uniques. Col mao, boutonnière centrale et deux poches plaquées. Tissu coton épais et durable.',
                'price'       => 78.00, 'oldPrice' => null, 'category' => 'Tops',
                'image'       => $IMG.'1540221652346-e5dd6b50f3e7'.$Q,
                'badge' => 'Nouveau', 'rating' => 4.6, 'reviewCount' => 29, 'stock' => 14,
                'colors' => ['#1ABC9C', '#2C3E50', '#E74C3C'],
                'sizes'  => ['S', 'M', 'L', 'XL', 'XXL'],
            ],
            [
                'name'        => 'Top Crochet Africain',
                'description' => 'Top court en crochet fait main avec des motifs inspirés des arts textiles d\'Afrique centrale. Bretelles larges et dos ouvert avec laçage. Coloris naturels et purs, teinture végétale sans produits chimiques. Associez-le à une jupe longue ou un pantalon taille haute.',
                'price'       => 48.00, 'oldPrice' => 65.00, 'category' => 'Tops',
                'image'       => $IMG.'1483985988355-763728e1935b'.$Q,
                'badge' => 'Vente', 'rating' => 4.3, 'reviewCount' => 51, 'stock' => 9,
                'colors' => ['#F5CBA7', '#A04000', '#1B4F72'],
                'sizes'  => ['XS', 'S', 'M', 'L'],
            ],
            // ── ACCESSOIRES ────────────────────────────────────────────────────
            [
                'name'        => 'Collier Perles Maasaï',
                'description' => 'Collier ras-du-cou en perles de rocaille tressées à la main par des femmes Maasaï de Tanzanie. Chaque collier est une œuvre artisanale unique dont les couleurs symbolisent des valeurs culturelles : rouge = bravoure, bleu = ciel et eau, blanc = paix. Fermoir argenté réglable.',
                'price'       => 38.00, 'oldPrice' => null, 'category' => 'Accessories',
                'image'       => $IMG.'1515562141207-7a88fb7ce338'.$Q,
                'badge' => null, 'rating' => 4.9, 'reviewCount' => 203, 'stock' => 40,
                'colors' => ['#E74C3C', '#3498DB', '#F1C40F'],
                'sizes'  => ['Taille unique'],
            ],
            [
                'name'        => 'Sac Wax Tissé Main',
                'description' => 'Grand sac cabas en tissu wax tressé renforcé de raphia naturel. Poignées en cuir véritable, doublure en coton et poche zippée intérieure. Contenance 18 L. Confectionné à Abidjan par un collectif d\'artisanes. Dimensions : 42 × 36 × 14 cm.',
                'price'       => 72.00, 'oldPrice' => null, 'category' => 'Accessories',
                'image'       => $IMG.'1548036328-c9fa89d128fa'.$Q,
                'badge' => 'Nouveau', 'rating' => 4.7, 'reviewCount' => 85, 'stock' => 20,
                'colors' => ['#F39C12', '#16A085', '#8E44AD'],
                'sizes'  => ['Taille unique'],
            ],
            [
                'name'        => 'Foulard Wax Imprimé',
                'description' => 'Carré de tissu wax 2,5 mètres pour un headwrap, turban ou foulard. Polyvalent et coloré, il se porte de dizaines de façons différentes. Tissu léger 100 % coton, infroissable et résistant à la décoloration. Livré avec un guide illustré de nouage traditionnel.',
                'price'       => 28.00, 'oldPrice' => null, 'category' => 'Accessories',
                'image'       => $IMG.'1552960562-daf630e9278b'.$Q,
                'badge' => null, 'rating' => 4.8, 'reviewCount' => 201, 'stock' => 50,
                'colors' => ['#E91E63', '#9C27B0', '#FF5722'],
                'sizes'  => ['Taille unique'],
            ],
            [
                'name'        => 'Boucles d\'oreille Kente',
                'description' => 'Boucles d\'oreilles pendantes fabriquées avec de véritables bandelettes de tissu Kente du Ghana montées sur anneaux dorés 18 carats. Légères (2 g chacune) et confortables pour la journée. Longueur 6 cm. Convient aux oreilles percées standard.',
                'price'       => 24.00, 'oldPrice' => 35.00, 'category' => 'Accessories',
                'image'       => $IMG.'1535632066927-ab7c9ab60908'.$Q,
                'badge' => 'Vente', 'rating' => 4.5, 'reviewCount' => 67, 'stock' => 35,
                'colors' => ['#D4AC0D', '#922B21', '#1F618D'],
                'sizes'  => ['Taille unique'],
            ],
            // ── ENSEMBLES ──────────────────────────────────────────────────────
            [
                'name'        => 'Ensemble Ankara Deux Pièces',
                'description' => 'Set coordonné haut-jupe en imprimé Ankara. Le haut à épaules dénudées et la jupe crayon midi forment une tenue parfaite pour les événements formels. Fermeture invisible dos sur la jupe. Confection artisanale au Nigeria. Disponible en 3 imprimés exclusifs.',
                'price'       => 110.00, 'oldPrice' => 145.00, 'category' => 'Sets',
                'image'       => $IMG.'1496747611176-843222e1e57c'.$Q,
                'badge' => 'Vente', 'rating' => 4.9, 'reviewCount' => 89, 'stock' => 8,
                'colors' => ['#8E44AD', '#2C3E50', '#E74C3C'],
                'sizes'  => ['S', 'M', 'L', 'XL'],
            ],
            [
                'name'        => 'Kaba & Slit Traditionnel',
                'description' => 'Costume traditionnel ghanéen Kaba & Slit composé d\'un corsage ajusté et d\'une jupe droite à fente. Tissu Kente authentique tissé main avec des fils de soie naturels. Broderies dorées sur le corsage. Livré avec un foulard assorti. Tenue de cérémonie par excellence.',
                'price'       => 185.00, 'oldPrice' => 240.00, 'category' => 'Sets',
                'image'       => $IMG.'1525507119028-ed4c629a60a3'.$Q,
                'badge' => 'Vente', 'rating' => 4.8, 'reviewCount' => 77, 'stock' => 5,
                'colors' => ['#1ABC9C', '#3498DB', '#9B59B6'],
                'sizes'  => ['S', 'M', 'L', 'XL'],
            ],
            [
                'name'        => 'Set Bogolan Premium',
                'description' => 'Ensemble complet veste + pantalon large en bogolan malien authentique. Motifs symboles Bambara peints à la main au kaolin et aux extraits de feuilles de n\'galama. Chaque pièce est signée par l\'artisan. Packaging soigné, idéal en cadeau. Certificat d\'authenticité inclus.',
                'price'       => 220.00, 'oldPrice' => null, 'category' => 'Sets',
                'image'       => $IMG.'1603251579431-8041402bdeda'.$Q,
                'badge' => 'Nouveau', 'rating' => 4.7, 'reviewCount' => 32, 'stock' => 4,
                'colors' => ['#6D4C41', '#4E342E', '#BF360C'],
                'sizes'  => ['S', 'M', 'L', 'XL'],
            ],
            [
                'name'        => 'Tailleur Wax Élégance',
                'description' => 'Tailleur veste + jupe courte en wax imprimé exclusif. La veste structurée à double boutonnage et la mini-jupe plissée créent une silhouette moderne et affirmée. Doublure soie, poches latérales fonctionnelles. Idéal pour le bureau ou une sortie urbaine chic.',
                'price'       => 155.00, 'oldPrice' => 195.00, 'category' => 'Sets',
                'image'       => $IMG.'1508214751196-bcfd4ca60f91'.$Q,
                'badge' => 'Vente', 'rating' => 4.6, 'reviewCount' => 54, 'stock' => 10,
                'colors' => ['#2C3E50', '#C0392B', '#D4AC0D'],
                'sizes'  => ['XS', 'S', 'M', 'L', 'XL'],
            ],
        ];

        foreach ($products as $data) {
            $p = new Product();
            $p->setName($data['name'])
              ->setDescription($data['description'])
              ->setPrice($data['price'])
              ->setOldPrice($data['oldPrice'])
              ->setCategory($data['category'])
              ->setImage($data['image'])
              ->setBadge($data['badge'])
              ->setRating($data['rating'])
              ->setReviewCount($data['reviewCount'])
              ->setStock($data['stock'])
              ->setColors($data['colors'])
              ->setSizes($data['sizes']);
            $this->em->persist($p);
        }

        $this->em->flush();
        $io->success(count($products).' produits importés avec succès.');
        return Command::SUCCESS;
    }
}
