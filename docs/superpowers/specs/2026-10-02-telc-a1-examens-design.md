# Examens TELC A1 – Lesen : conception

> Modèle de référence : `telc_deutsch_a1_uebungstest_1.pdf`, *telc Deutsch A1 (Start Deutsch 1), Übungstest 1*, édition 2021. La plateforme reprend la structure et les formats comme modèle de saisie ; elle n’importe pas automatiquement le PDF.

## Objectif

Permettre aux professeurs de gérer des examens TELC Deutsch A1 de type Lesen et de lancer des sessions auxquelles les étudiants participent depuis un téléphone ou un ordinateur. Pendant une session, le professeur suit la connexion, la progression par tâche et la fin de chaque étudiant, sans accéder à ses réponses.

## Périmètre de la première version

- Un professeur peut créer, consulter, modifier et supprimer ses examens TELC A1 – Lesen.
- L’examen reproduit la structure de Lesen du modèle : trois parties (*Teile*), cinq tâches par partie, quinze tâches au total.
  - Teil 1 : cinq affirmations auxquelles répondre « richtig » ou « falsch », à partir de courts messages/textes.
  - Teil 2 : cinq situations/questions où l’étudiant choisit l’une de deux annonces ou sources, identifiées A et B.
  - Teil 3 : cinq affirmations « richtig » ou « falsch », à partir de panneaux, avis ou annonces courtes.
- Chaque partie possède ses consignes et ses supports de lecture. Les tâches sont ordonnées et liées à un support. Teil 1 et Teil 3 utilisent le type de réponse vrai/faux ; Teil 2 utilise un choix unique A/B. Chaque tâche ne reçoit qu’une réponse sélectionnée ; aucune réponse libre n’est prévue pour Lesen.
- Dans le formulaire professeur du Teil 2, chaque tâche présente le prompt puis deux cartes A et B côte à côte. Chaque carte a un en-tête/source (par exemple un nom de site), un titre facultatif et un contenu avec sauts de ligne. Les lettres sont fixes et non éditables. L’éditeur affiche ces cartes comme une prévisualisation de supports, avec contours et hiérarchie typographique, pas comme deux champs de texte nus. Sur téléphone, les cartes s’empilent. Le professeur choisit la bonne lettre dans une commande séparée de l’aperçu.
- Le professeur peut créer, modifier et supprimer le titre, les consignes, les supports de lecture, les affirmations/situations, les choix et la clé de correction de ses examens.
- Le professeur crée et lance une session à partir d’un examen existant et choisit les étudiants participants parmi ses propres étudiants.
- Un étudiant authentifié rejoint par code une session ouverte à laquelle il a été préalablement affecté par le professeur.
- Au lancement, le support de lecture de la partie active s’affiche sur l’écran du professeur ; les étudiants voient les consignes/questions et leurs choix sur leur appareil et s’appuient sur le support affiché. L’interface étudiant est adaptée au mobile et au bureau.
- L’étudiant peut naviguer entre les trois parties (*Teil 1*, *Teil 2*, *Teil 3*) et leurs tâches, enregistrer/modifier ses choix tant que la session est ouverte et terminer son examen.
- Le professeur voit en direct, pour chaque étudiant, sa présence, les numéros des tâches répondues dans chaque *Teil*, le nombre répondu sur le total et son statut (en attente, en cours, terminé). Il peut sélectionner le support de lecture à afficher ; ce choix d’affichage ne remplace pas la navigation individuelle de l’étudiant.
- Sur l’écran de passation/suivi en direct, le professeur voit uniquement le support de lecture qu’il affiche, la connexion et la progression par tâche, ainsi que le statut terminé. Il ne voit ni les consignes/questions, ni les cartes de choix A/B (ou vrai/faux), ni le choix sélectionné d’un étudiant. L’interface étudiant est le seul écran de passation qui montre les questions et les choix. Le formulaire professeur de création/modification reste l’interface d’administration du contenu et de la clé de correction.
- Les réponses et états sont persistés en base ; la diffusion temps réel est une mise à jour de l’interface, pas le stockage de référence.

## Hors périmètre

- Hören, Schreiben et Sprechen ; synchronisation audio ou lancement d’un audio commun. Le modèle indique environ 25 minutes pour Lesen ; le chronomètre n’est pas inclus dans cette première version.
- Correction automatique, notes, résultats et consultation des réponses par le professeur.
- Import automatique du PDF TELC, copie de contenu protégé, génération d’examens ou banque de questions partagée entre professeurs.
- Surveillance anti-triche, verrouillage du navigateur, webcam, proctoring, minuterie d’examen et reprise d’un examen terminé.
- Comptes invités ou accès à l’examen sans authentification.

## Rôles et parcours

### Professeur

1. Ouvre la gestion des examens depuis son espace professeur.
2. Crée un examen avec titre, niveau A1, les trois parties et cinq tâches par partie. Il définit pour chaque partie les supports de lecture et consignes, puis saisit les affirmations/situations, les choix adaptés (richtig/falsch ou A/B) et la clé de correction.
3. Modifie ou supprime uniquement ses propres examens. La suppression d’un examen jamais utilisé le supprime définitivement. Si une session le référence, la suppression l’archive : il disparaît des nouveaux lancements mais reste disponible pour consulter l’historique.
4. Choisit un examen et ses étudiants, puis crée et démarre une session.
5. Sur l’écran de suivi, choisit le support de lecture à afficher et observe les étudiants connectés, les cases de progression groupées par Teil et l’état de fin.
6. À la fermeture de la session, consulte le récapitulatif de progression, toujours sans les réponses choisies.

### Étudiant

1. Se connecte avec son compte étudiant.
2. Accède à ses sessions d’examen assignées et rejoint une session ouverte.
3. Consulte les consignes et les questions sur son appareil ; il utilise le support de lecture affiché par le professeur et ses choix sont automatiquement sauvegardés.
4. Termine explicitement l’examen. Le serveur enregistre l’heure de fin et refuse toute modification ultérieure.
5. Si sa connexion coupe avant la fin, il peut revenir dans la session ouverte et retrouver les réponses enregistrées.

## États et règles métier

- Examen : brouillon ou disponible. Seuls les examens disponibles avec leurs trois parties et cinq tâches par partie peuvent être lancés.
- Session : planifiée, ouverte, terminée. Seul le professeur propriétaire peut ouvrir ou terminer une session.
- Participation : en attente, en cours, terminée. La présence réseau est une information distincte, volatile, et ne remplace pas le statut persisté.
- Une réponse est considérée comme répondue si un choix valide est sauvegardé pour la tâche. Le professeur reçoit uniquement l’identifiant opaque de participation (ou l’étudiant concerné dans le canal autorisé), les identifiants/numéros de tâches répondues par Teil et les totaux.
- « Terminer l’examen » est une action explicite et irréversible pour l’étudiant ; elle verrouille ses réponses.
- La fermeture par le professeur clôt la session pour tous. Les soumissions reçues après fermeture sont refusées côté serveur.
- Chaque opération vérifie que le professeur possède l’examen/session et que l’étudiant est inscrit à la session. Les identifiants envoyés par le navigateur ne suffisent jamais à accorder l’accès.

## Architecture proposée

- Laravel fournit les routes web authentifiées, contrôleurs, Form Requests, policies, modèles, migrations et événements.
- Inertia/React fournit des pages distinctes pour la gestion professeur, le suivi de session et la participation étudiant, en reprenant le design et les composants existants.
- La gestion professeur réutilise les conventions visuelles des pages existantes Sessions et Salaires (conteneur, titres, séparateurs, tableaux, filtres/pagination, boutons, formulaires, confirmations, toasts et breadcrumbs). Dans l’éditeur du Teil 2, les cartes A/B structurées et leur aperçu gardent la même charte visuelle.
- Laravel Reverb diffuse les événements de session. Le canal privé de suivi est accessible uniquement au professeur propriétaire ; le canal privé étudiant est limité à la participation de cet étudiant. Les événements destinés au professeur excluent explicitement les choix de réponse.
- Les écritures (réponses, présence persistée, fin d’examen, ouverture/fermeture) sont validées et enregistrées côté Laravel avant l’émission d’un événement. L’écran professeur charge un état initial depuis la base, puis applique les événements et peut se resynchroniser depuis un endpoint de lecture.
- Le système doit s’intégrer à la configuration Laravel/React existante. La disponibilité de Reverb, des dépendances de diffusion et des variables d’environnement devra être vérifiée pendant l’implémentation ; toute configuration requise sera documentée.

## Données conceptuelles

- Examen : propriétaire professeur, titre, niveau, statut.
- Partie (*Teil*) : examen parent, numéro (1 à 3), consignes, type de réponse, supports de lecture et ordre.
- Tâche : partie parente, affirmation ou situation, support associé, ordre et choix de réponse. Les Teile 1 et 3 proposent « richtig »/« falsch » ; le Teil 2 propose « A »/« B ».
- Clé de correction : tâche et choix correct, conservés côté serveur et non exposés aux pages étudiant ni aux événements de progression pendant la session.
- Session d’examen : examen, professeur propriétaire, état, dates d’ouverture/fermeture et étudiants assignés.
- Participation : session, étudiant, état, date de fin.
- Réponse : participation, tâche, choix sélectionné, horodatage de dernière sauvegarde.

À l’ouverture d’une session, le contenu de l’examen (Teile, supports, tâches et choix) est copié dans un snapshot propre à cette session. Le professeur choisit le support actuellement affiché dans son écran ; l’étudiant garde sa navigation individuelle entre les tâches. Les modifications ultérieures de l’examen ne changent pas les sessions ouvertes ni leur historique. Une session référencée empêche la suppression physique de son examen ; l’action supprimer archive l’examen.

## Confidentialité et autorisations

- Le rôle `teacher` gère ses propres examens et sessions uniquement.
- Le rôle `student` voit seulement les sessions qui lui sont assignées et ses propres réponses.
- Aucune réponse sélectionnée, correction ou bonne réponse ne figure dans les props Inertia étudiant ni dans un événement de progression professeur.
- L’autorisation est vérifiée sur chaque requête et chaque abonnement de canal privé.
- Les payloads Reverb sont minimaux : présence, progression (numéros des questions répondues et total) et statut de participation.
- La validation des choix confirme que la tâche appartient bien à l’examen snapshot de la session et que le choix appartient à cette tâche.

## Résilience et comportement réseau

- La sauvegarde d’une réponse est confirmée par le serveur ; l’interface indique l’état d’enregistrement.
- Une reconnexion recharge l’état depuis la base et réabonne l’utilisateur aux canaux autorisés.
- Un événement perdu ne doit pas rendre l’état durablement incohérent : l’écran professeur peut recharger la progression persistée.
- Les événements ne constituent jamais l’unique preuve qu’un étudiant est présent ou qu’il a répondu.

## Critères d’acceptation

1. Un professeur peut créer, lister, modifier et supprimer/archiver ses examens A1, et les opérations inter-professeurs sont refusées.
2. Un professeur peut lancer une session pour un examen disponible et affecter uniquement ses propres étudiants.
3. Un étudiant affecté peut rejoindre avec le code de session, voit les consignes/questions et choix sur ordinateur et mobile, et le professeur voit les supports de lecture. Un étudiant non affecté ne peut ni rejoindre malgré la possession du code, ni soumettre une réponse.
4. Une réponse valide est sauvegardée, retrouvée après rechargement et comptée une seule fois dans la progression.
5. Le professeur reçoit les changements de progression en temps réel et voit les tâches répondues, regroupées par Teil, sans connaître les choix.
6. Un étudiant peut terminer ; son statut passe à terminé et les réponses deviennent immuables.
7. Une session fermée refuse les nouvelles sauvegardes et la progression finale reste consultable.
8. Une reconnexion remet l’écran à jour à partir de l’état persisté.

## Questions d’implémentation déjà tranchées

- Première phase : Lesen uniquement.
- Audience : utilisateurs authentifiés existants, rôles professeur et étudiant.
- Temps réel : Laravel Reverb, avec état durable en base de données.
- Confidentialité : le professeur suit la progression, jamais les choix pendant la session.
- Plateformes : navigateur mobile et ordinateur, interface React responsive.
- Modèle de référence Lesen : trois Teile de cinq tâches ; Teile 1 et 3 en vrai/faux, Teil 2 en choix A/B ; support de lecture affiché côté professeur.

## Référence consultée

- telc gGmbH, *Start Deutsch 1 / telc Deutsch A1, Übungstest 1*, édition 2021 : format de l’examen p. 5, consignes Lesen p. 13 et exercices des Teile 1 à 3 p. 14–19. [PDF officiel telc](https://shop.telc.net/media/catalog/product/file//2/0/20210103_5070-b00-010106_web_1.pdf).
