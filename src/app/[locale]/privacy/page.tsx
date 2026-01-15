import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = params as unknown as { locale: string };
  setRequestLocale(resolvedParams.locale);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à l'accueil
      </Link>

      <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <p className="text-muted-foreground">
          Dernière mise à jour : Janvier 2025
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Bienvenue sur Bokkal, la plateforme d'événements de la Petite Côte au Sénégal.
            Nous nous engageons à protéger votre vie privée et vos données personnelles.
            Cette politique de confidentialité explique comment nous collectons, utilisons
            et protégeons vos informations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Données collectées</h2>
          <p>Nous collectons les types de données suivants :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Informations de compte :</strong> nom, adresse email, photo de profil
              lors de votre inscription
            </li>
            <li>
              <strong>Données d'événements :</strong> informations sur les événements que
              vous créez (titre, description, lieu, date, images)
            </li>
            <li>
              <strong>Données de localisation :</strong> coordonnées géographiques des
              événements que vous publiez
            </li>
            <li>
              <strong>Données d'utilisation :</strong> interactions avec la plateforme,
              événements consultés, préférences
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. Utilisation des données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Publier et afficher les événements sur la plateforme</li>
            <li>Améliorer nos services et l'expérience utilisateur</li>
            <li>Vous envoyer des notifications relatives à vos événements (si autorisé)</li>
            <li>Assurer la sécurité de la plateforme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. Partage des données</h2>
          <p>
            Nous ne vendons pas vos données personnelles. Les informations des événements
            que vous publiez sont visibles publiquement sur la plateforme. Nous pouvons
            partager des données avec :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Fournisseurs de services :</strong> hébergement, stockage d'images,
              services d'authentification
            </li>
            <li>
              <strong>Autorités légales :</strong> si requis par la loi sénégalaise
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Stockage et sécurité</h2>
          <p>
            Vos données sont stockées de manière sécurisée sur des serveurs protégés.
            Nous utilisons le chiffrement SSL/TLS pour protéger les transmissions de données.
            L'accès aux données personnelles est limité aux personnes autorisées.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Vos droits</h2>
          <p>Conformément à la réglementation, vous disposez des droits suivants :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Accès :</strong> demander une copie de vos données personnelles</li>
            <li><strong>Rectification :</strong> corriger vos informations inexactes</li>
            <li><strong>Suppression :</strong> demander la suppression de votre compte et données</li>
            <li><strong>Opposition :</strong> vous opposer à certains traitements de données</li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, contactez-nous à l'adresse indiquée ci-dessous.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
          <p>
            Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme
            (authentification, préférences de langue). Aucun cookie publicitaire ou de
            tracking tiers n'est utilisé.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">8. Modifications</h2>
          <p>
            Cette politique peut être mise à jour. Les modifications importantes seront
            communiquées sur la plateforme. Nous vous encourageons à consulter régulièrement
            cette page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">9. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou vos données
            personnelles, contactez-nous :
          </p>
          <p className="mt-4">
            <strong>Email :</strong> contact@bokkal.sn
          </p>
        </section>
      </div>
    </div>
  );
}
