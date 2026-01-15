import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUsePage({
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

      <h1 className="text-3xl font-bold mb-8">Conditions d'Utilisation</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <p className="text-muted-foreground">
          Dernière mise à jour : Janvier 2025
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-4">1. Acceptation des conditions</h2>
          <p>
            En utilisant Bokkal, vous acceptez les présentes conditions d'utilisation.
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.
            Bokkal est une plateforme de publication d'événements pour la région de la
            Petite Côte au Sénégal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Description du service</h2>
          <p>
            Bokkal permet aux utilisateurs de :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Découvrir des événements dans la région de la Petite Côte</li>
            <li>Publier des événements (concerts, marchés, activités sportives, etc.)</li>
            <li>Visualiser les événements sur une carte interactive</li>
            <li>Filtrer les événements par catégorie, ville et date</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. Inscription et compte</h2>
          <p>
            Pour publier des événements, vous devez créer un compte. Vous vous engagez à :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Fournir des informations exactes et à jour</li>
            <li>Maintenir la confidentialité de vos identifiants de connexion</li>
            <li>Nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
            <li>Être responsable de toutes les activités effectuées depuis votre compte</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. Publication d'événements</h2>
          <p>
            En publiant un événement sur Bokkal, vous garantissez que :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Les informations fournies sont exactes et véridiques</li>
            <li>Vous avez le droit de publier cet événement</li>
            <li>L'événement respecte les lois sénégalaises en vigueur</li>
            <li>Les images utilisées vous appartiennent ou vous avez le droit de les utiliser</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Contenus interdits</h2>
          <p>
            Il est strictement interdit de publier des contenus :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Illégaux, frauduleux ou trompeurs</li>
            <li>Diffamatoires, injurieux ou discriminatoires</li>
            <li>À caractère pornographique ou violent</li>
            <li>Portant atteinte aux droits de propriété intellectuelle</li>
            <li>Contenant des virus ou codes malveillants</li>
            <li>Faisant la promotion d'activités illégales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Modération</h2>
          <p>
            Bokkal se réserve le droit de :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Supprimer tout contenu ne respectant pas ces conditions</li>
            <li>Suspendre ou supprimer les comptes en infraction</li>
            <li>Modifier ou supprimer des événements sans préavis</li>
            <li>Refuser l'accès à la plateforme à tout utilisateur</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Responsabilité</h2>
          <p>
            Bokkal est une plateforme de mise en relation. Nous ne sommes pas responsables :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>De l'exactitude des informations publiées par les utilisateurs</li>
            <li>De l'annulation ou modification d'événements par les organisateurs</li>
            <li>Des transactions effectuées entre utilisateurs et organisateurs</li>
            <li>Des dommages résultant de l'utilisation de la plateforme</li>
          </ul>
          <p className="mt-4">
            La plateforme est fournie "en l'état". Nous ne garantissons pas un fonctionnement
            ininterrompu ou sans erreur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">8. Propriété intellectuelle</h2>
          <p>
            Le contenu de Bokkal (logo, design, code) est protégé par les droits de propriété
            intellectuelle. Vous conservez les droits sur le contenu que vous publiez, mais
            accordez à Bokkal une licence non exclusive pour afficher ce contenu sur la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">9. Modifications des conditions</h2>
          <p>
            Nous pouvons modifier ces conditions à tout moment. Les modifications entrent en
            vigueur dès leur publication. L'utilisation continue de la plateforme après
            modification vaut acceptation des nouvelles conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">10. Droit applicable</h2>
          <p>
            Ces conditions sont régies par le droit sénégalais. Tout litige sera soumis aux
            tribunaux compétents du Sénégal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation :
          </p>
          <p className="mt-4">
            <strong>Email :</strong> contact@bokkal.sn
          </p>
        </section>
      </div>
    </div>
  );
}
