import React from 'react';

const CGUPage: React.FC = () => {
  return (
    <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
      <p className="text-xs text-gray-500">Dernière mise à jour : 1er février 2025</p>

      <section>
        <h4 className="text-white font-semibold mb-2">1. Objet</h4>
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de l'application
          Kaizen Quest (ci-après « l'Application »), un service de gamification du développement personnel
          proposé par Kaizen Quest (ci-après « l'Éditeur »). En utilisant l'Application, vous acceptez
          sans réserve les présentes CGU.
        </p>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">2. Description du service</h4>
        <p>
          Kaizen Quest est une application web qui génère des quêtes quotidiennes personnalisées
          pour accompagner les utilisateurs dans leur développement personnel. L'Application propose :
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
          <li>La génération de quêtes quotidiennes via intelligence artificielle</li>
          <li>Un système de progression (niveaux, XP, badges)</li>
          <li>Un suivi d'objectifs personnels avec thèmes</li>
          <li>Une narration personnalisée de progression</li>
          <li>Un abonnement Premium avec fonctionnalités étendues</li>
        </ul>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">3. Inscription et compte</h4>
        <p>
          L'accès à l'Application nécessite une authentification via un compte Google ou Apple.
          L'utilisateur s'engage à fournir des informations exactes lors de son inscription.
          Chaque utilisateur est responsable de la confidentialité de son compte et de toutes
          les activités effectuées sous celui-ci.
        </p>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">4. Données personnelles</h4>
        <p>Les données collectées et stockées sont :</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
          <li>Informations d'identification (nom, email, photo de profil) fournies par le fournisseur d'authentification</li>
          <li>Données de progression dans l'Application (niveau, quêtes complétées, objectifs, badges)</li>
          <li>Historique des quêtes réalisées</li>
        </ul>
        <p className="mt-2">
          Les données sont stockées de manière sécurisée via Google Firebase (Firestore) et sont
          accessibles uniquement par l'utilisateur authentifié. Aucune donnée n'est vendue ou
          partagée avec des tiers à des fins commerciales.
        </p>
        <p className="mt-2">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression
          de vos données. Vous pouvez supprimer votre compte et l'intégralité de vos données à tout
          moment depuis les paramètres de l'Application (Mon compte &gt; Supprimer mon compte).
        </p>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">5. Contenu généré par intelligence artificielle</h4>
        <p>
          L'Application utilise l'API Claude d'Anthropic pour générer du contenu personnalisé
          (quêtes, messages de complétion, récits de progression). Ce contenu est généré
          automatiquement et à titre informatif uniquement.
        </p>
        <p className="mt-2">
          L'Éditeur ne garantit pas l'exactitude, la pertinence ou l'exhaustivité du contenu
          généré par l'IA. Les quêtes proposées sont des suggestions et ne constituent en aucun
          cas des conseils médicaux, psychologiques ou professionnels. L'utilisateur est seul
          responsable de l'exécution des actions suggérées et doit faire preuve de discernement.
        </p>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">6. Abonnement Premium</h4>
        <p>
          L'Application propose une version gratuite (Freemium) et une version Premium avec des
          fonctionnalités supplémentaires (quêtes additionnelles, renouvellement de quêtes,
          objectifs multiples, messages personnalisés par IA).
        </p>
        <p className="mt-2">
          Les modalités de paiement, tarifs et conditions d'annulation de l'abonnement Premium
          seront précisés lors de la souscription. L'Éditeur se réserve le droit de modifier
          les fonctionnalités incluses dans chaque offre.
        </p>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">7. Responsabilités de l'utilisateur</h4>
        <p>L'utilisateur s'engage à :</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
          <li>Utiliser l'Application de manière conforme à sa finalité</li>
          <li>Ne pas tenter de contourner les limitations techniques de l'Application</li>
          <li>Ne pas utiliser l'Application à des fins illicites ou contraires aux bonnes mœurs</li>
          <li>Évaluer par lui-même la faisabilité et la sécurité des quêtes proposées</li>
        </ul>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">8. Limitation de responsabilité</h4>
        <p>
          L'Éditeur met tout en œuvre pour assurer la disponibilité et le bon fonctionnement
          de l'Application, mais ne peut garantir une disponibilité ininterrompue. L'Éditeur
          ne saurait être tenu responsable :
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
          <li>Des dommages directs ou indirects résultant de l'utilisation de l'Application</li>
          <li>De la perte de données en cas de défaillance technique</li>
          <li>Des conséquences liées à l'exécution des quêtes suggérées par l'IA</li>
          <li>Des interruptions de service liées à des tiers (Firebase, Anthropic)</li>
        </ul>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">9. Propriété intellectuelle</h4>
        <p>
          L'ensemble des éléments de l'Application (design, code, textes, concept de gamification)
          est la propriété exclusive de l'Éditeur. Toute reproduction ou utilisation non autorisée
          est interdite. Le contenu généré par l'IA dans le cadre de l'utilisation de l'Application
          est mis à disposition de l'utilisateur pour un usage personnel uniquement.
        </p>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">10. Modification des CGU</h4>
        <p>
          L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment.
          Les utilisateurs seront informés des modifications substantielles. La poursuite
          de l'utilisation de l'Application après modification vaut acceptation des nouvelles CGU.
        </p>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">11. Droit applicable</h4>
        <p>
          Les présentes CGU sont régies par le droit français. Tout litige relatif à
          l'interprétation ou l'exécution des présentes sera soumis aux tribunaux compétents.
        </p>
      </section>

      <section>
        <h4 className="text-white font-semibold mb-2">12. Contact</h4>
        <p>
          Pour toute question relative aux présentes CGU ou à l'Application, vous pouvez
          nous contacter à l'adresse : <span className="text-purple-400">contact@kaizenquest.app</span>
        </p>
      </section>
    </div>
  );
};

export default CGUPage;
