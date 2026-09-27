# Propulse — Cahier des charges fonctionnel et technique

## 1. Objectif du produit

Propulse doit permettre à un professeur de gérer ses étudiants, ses sessions de cours, ses séances et les présences. L'administrateur consulte l'avancement global et la rémunération sans intervenir dans la création ou la gestion quotidienne des données pédagogiques.

L'application remplace le fichier Excel actuellement utilisé pour les présences.

## 2. Principes retenus

- Les deux rôles interactifs sont `teacher` et `admin`.
- Un rôle technique `student` est attribué automatiquement lors de la création d'un étudiant. Aucun sélecteur de rôle n'est affiché.
- Les étudiants n'ont pas d'espace connecté dans la première version.
- L'administrateur est en lecture seule sur le domaine pédagogique : il ne crée ni niveau, ni étudiant, ni session, ni séance.
- Le professeur crée et gère ses étudiants, sessions, séances et présences.
- Les sous-niveaux et leur ordre sont prédéfinis dans le code puis installés en base de données.
- La durée cible par défaut d'un sous-niveau est de 30 heures.
- Le tarif est fixe : 20 TND par heure réellement enseignée.
- Une session peut être clôturée manuellement avant ou après les 30 heures.
- Le nombre et la durée des séances par semaine sont libres.
- Le CRUD historique **Formules et prix** sert uniquement de référence visuelle. Ses conventions sont reproduites dans les nouveaux écrans, puis son code est supprimé.

## 3. Vocabulaire métier

### Sous-niveau

Une étape pédagogique ordonnée, par exemple A1.1, A1.2 ou A2.1. Chaque sous-niveau possède une position dans le parcours et une durée cible exprimée en minutes. La valeur initiale est 1 800 minutes, soit 30 heures.

### Session

Un groupe concret d'étudiants qui suit un sous-niveau. Plusieurs sessions du même sous-niveau peuvent exister simultanément.

Exemples :

- A1.1 — Matin ;
- A1.1 — Soir ;
- A1.1 — Samedi.

Une session contient sa propre liste d'étudiants, son professeur, sa durée cible, son tarif horaire, ses séances et son état d'avancement. Il n'est pas nécessaire d'ajouter une entité `group` distincte dans la première version : la session joue ce rôle.

### Séance

Un cours réellement donné à une date précise, avec une heure de début facultative. Le professeur saisit la durée en heures dans l'interface (`2` pour deux heures, `1,5` pour une heure et demie) ; le backend la convertit et la conserve en minutes. Une session peut avoir trois, quatre, cinq séances ou davantage par semaine.

### Présence

Pour chaque étudiant inscrit à la session et chaque séance, le professeur indique `present` ou `absent`.

## 4. Catalogue des sous-niveaux

Le catalogue est idempotent : une nouvelle exécution met à jour les valeurs sans créer de doublons.

Le catalogue initial proposé est : A1.1, A1.2, A2.1, A2.2, B1.1, B1.2, B2.1, B2.2, C1.1, C1.2, C2.1 et C2.2. Cet ordre sera défini dans un seeder dédié, par exemple `CourseLevelSeeder`. Son exécution en production se fera explicitement avec :

```bash
php artisan db:seed --class=CourseLevelSeeder --force
```

Les durées sont enregistrées en minutes. Le seeder fournit 1 800 minutes par défaut, tout en permettant de modifier ultérieurement la durée d'un sous-niveau dans le code puis de relancer le déploiement. Aucun CRUD de niveaux n'est nécessaire dans la première version.

Lors de la création d'une session, la durée du niveau est copiée dans la session. Une modification future du catalogue ne change donc pas l'historique des sessions déjà créées.

## 5. Gestion des utilisateurs et rôles

### Administrateur

- se connecte à l'application ;
- consulte le tableau de bord global ;
- consulte les sessions, séances, présences, étudiants et rémunérations ;
- ne modifie pas les données pédagogiques.

### Professeur

- se connecte à l'application ;
- crée et modifie ses étudiants ;
- crée et gère ses sessions ;
- ajoute les séances et enregistre les présences ;
- clôture ses sessions ;
- consulte son propre avancement et sa rémunération.

### Étudiant

- est créé par le professeur avec uniquement son nom complet ;
- reçoit automatiquement le rôle `student` dans le code ;
- ne choisit jamais son rôle ;
- ne possède ni email, ni mot de passe, ni accès connecté dans la première version.

Le modèle utilisateur devra donc accepter des comptes étudiants sans identifiants de connexion, tout en conservant email et mot de passe obligatoires pour les administrateurs et professeurs.

## 6. Workflow du professeur

### 6.1 Créer les étudiants

Le professeur ouvre **Étudiants**, puis renseigne le nom complet de l'étudiant.

Le backend crée l'utilisateur et lui attribue le rôle `student` automatiquement. Le professeur peut ensuite corriger le nom complet. La suppression physique est évitée si l'étudiant possède déjà un historique ; il est alors archivé.

### 6.2 Créer une session

Le professeur renseigne :

- un libellé permettant de distinguer la session, par exemple `A1.1 — Matin` ;
- le sous-niveau ;
- la date de début ;
- les étudiants sélectionnés.

Le backend ajoute automatiquement :

- le professeur connecté ;
- la durée cible issue du sous-niveau, généralement 1 800 minutes ;
- le tarif de 20 000 millimes par heure, soit 20 TND ;
- le statut `active`.

### 6.3 Continuer avec des étudiants d'une ancienne session

Depuis une session terminée, le professeur clique sur **Créer la session suivante**.

L'application :

1. propose le sous-niveau suivant selon l'ordre du catalogue ;
2. présélectionne les étudiants de l'ancienne session ;
3. permet d'enlever les étudiants qui ont abandonné ;
4. permet d'ajouter de nouveaux étudiants ;
5. crée une nouvelle session avec un compteur d'heures remis à zéro ;
6. conserve un lien vers la session précédente pour afficher le parcours.

Il n'existe aucun workflow de promotion, redoublement ou résultat pédagogique dans la première version.

### 6.4 Ajouter une séance

Le professeur sélectionne une session active puis renseigne :

- la date ;
- l'heure de début, facultative ;
- la durée en heures, sans conversion manuelle ;
- le statut présent ou absent de chaque étudiant inscrit.

La sauvegarde de la séance et des présences est atomique : en cas d'erreur, aucune donnée partielle n'est conservée.

### 6.5 Suivre l'avancement

L'application calcule en temps réel :

```text
heures réalisées = somme des minutes des séances / 60
progression = minutes réalisées / minutes cibles × 100
rémunération = minutes réalisées × tarif horaire / 60
```

Exemple : 24 heures réalisées à 20 TND donnent 480 TND.

La progression peut dépasser 100 % si le professeur dépasse la durée cible.

### 6.6 Clôturer une session

Le professeur clôture manuellement la session, quel que soit le nombre d'heures réalisées. La clôture renseigne le statut `completed` et la date de fin réelle.

Une session clôturée reste consultable avec toutes ses séances, présences et sa rémunération. Elle sert également de point de départ à la création de la session suivante.

## 7. Workflow de l'administrateur

L'administrateur arrive sur un tableau de bord en lecture seule présentant :

- le nombre de sessions actives et terminées ;
- l'avancement de chaque session ;
- les heures réalisées et les heures cibles ;
- la dernière séance enregistrée ;
- le nombre d'étudiants par session ;
- les présences et absences ;
- la rémunération cumulée ;
- la rémunération filtrée par période et par professeur.

Depuis une session, il peut consulter la liste des étudiants, le détail des séances et la feuille de présence. Il ne dispose d'aucun bouton de création, modification, clôture ou suppression sur ces données.

## 8. Modèle de données proposé

### `users`

- `id` UUID ;
- `name` (nom complet) ;
- `teacher_id` nullable, identifiant du professeur responsable ;
- `email` nullable uniquement pour les étudiants ;
- `password` nullable uniquement pour les étudiants ;
- `archived_at` nullable ;
- timestamps.

Les rôles restent gérés par Spatie Permission. Les anciens rôles sont remplacés ou nettoyés au profit de `admin`, `teacher` et `student`.

### `course_levels`

- `id` UUID ;
- `code` unique, par exemple `A1.1` ;
- `name` ;
- `position` unique ;
- `target_minutes`, 1 800 par défaut ;
- `is_active` ;
- timestamps.

### `course_sessions`

- `id` UUID ;
- `teacher_id` vers `users` ;
- `course_level_id` ;
- `previous_session_id` nullable ;
- `label` ;
- `target_minutes` copié depuis le niveau ;
- `hourly_rate_millimes`, fixé initialement à 20 000 ;
- `starts_on` ;
- `completed_at` nullable ;
- `status` : `active` ou `completed` ;
- timestamps.

### `course_session_student`

- `course_session_id` ;
- `student_id` vers `users` ;
- `enrolled_at` ;
- `left_at` nullable ;
- contrainte unique sur session et étudiant.

Cette table conserve la liste historique des étudiants de chaque session.

### `lessons`

- `id` UUID ;
- `course_session_id` ;
- `held_on` ;
- `starts_at` nullable ;
- `duration_minutes` strictement positif ;
- timestamps.

### `attendances`

- `id` UUID ;
- `lesson_id` ;
- `student_id` ;
- `status` : `present` ou `absent` ;
- timestamps ;
- contrainte unique sur séance et étudiant.

## 9. Règles métier du backend

- Un professeur ne consulte et ne modifie que ses propres données pédagogiques.
- Un administrateur peut tout consulter, sans mutation pédagogique.
- Un étudiant ajouté à une séance doit appartenir à la session concernée.
- Une séance appartient à une seule session.
- Une durée de séance doit être strictement positive.
- La progression et la rémunération sont calculées depuis les séances ; elles ne sont pas saisies manuellement.
- Les calculs utilisent les minutes et les millimes afin d'éviter les erreurs d'arrondi.
- La création d'une session suivante duplique uniquement les inscriptions sélectionnées, jamais les séances ou présences.
- Les valeurs de durée et de tarif sont figées sur chaque session pour préserver l'historique.
- Les opérations comprenant plusieurs écritures utilisent une transaction SQL.
- Les autorisations sont appliquées côté backend avec policies et permissions, indépendamment de l'affichage des boutons.

## 10. API web et organisation Laravel

Le projet reste une application Laravel, Inertia et React.

Le backend sera organisé autour de :

- Form Requests pour la validation ;
- Policies pour isoler les données de chaque professeur ;
- Actions métier pour créer une session, enregistrer une séance et créer la session suivante ;
- contrôleurs légers séparés entre l'espace professeur et l'espace administrateur ;
- relations Eloquent explicites ;
- valeurs métier représentées par des enums PHP ;
- agrégats SQL pour les tableaux de bord afin d'éviter les requêtes N+1.

Les routes seront séparées :

```text
/teacher/*  gestion opérationnelle du professeur
/admin/*    consultation globale de l'administrateur
```

## 11. Première phase : espace professeur

L'implémentation commence par le professeur, dans cet ordre :

1. remplacer les rôles existants par `admin`, `teacher` et `student` ;
2. adapter les utilisateurs pour conserver un nom complet et permettre les étudiants sans connexion ;
3. ajouter et installer le catalogue ordonné des sous-niveaux ;
4. construire le CRUD professeur des étudiants ;
5. construire la création et la liste des sessions ;
6. permettre la sélection des étudiants d'une session ;
7. construire les séances et la prise de présence ;
8. afficher progression et rémunération ;
9. ajouter la clôture manuelle ;
10. ajouter la création de la session suivante.

L'espace administrateur sera construit après validation complète du workflow professeur.

## 12. Interface

Les nouveaux CRUD reprennent les conventions visuelles de **Formules et prix** :

- titres et textes d'accompagnement ;
- tableaux paginés ;
- formulaires centrés ;
- breadcrumbs ;
- composants de formulaire existants ;
- badges de statut ;
- notifications de succès et erreurs de validation.

L'interface ne présente jamais un champ de sélection de rôle lors de la création d'un étudiant.

## 13. Nettoyage de l'ancienne application

### À conserver

- Laravel, Inertia, React et Wayfinder ;
- authentification des administrateurs et professeurs ;
- paramètres de compte utiles ;
- layouts et composants UI génériques ;
- tableaux, pagination, formulaires, modales et notifications ;
- configuration de Spatie Permission.

### À retirer progressivement

- domaine membre devenu inutile ;
- ressources réservées aux membres ;
- masterclass ;
- Formules et prix après reproduction de ses conventions visuelles ;
- abonnements, commandes et paiements ;
- routes, contrôleurs, modèles, migrations, pages React, types et tests associés ;
- pages publiques sans utilité dans la nouvelle application.

Le nettoyage se fera domaine par domaine après une recherche des dépendances. Aucun fichier modifié ou non suivi ne sera supprimé sans avoir vérifié qu'il appartient bien à l'ancienne application.

## 14. Tests et critères d'acceptation

La première phase est acceptée lorsque :

- un professeur peut créer un étudiant avec son nom complet seulement ;
- le rôle `student` est attribué automatiquement ;
- un professeur ne peut pas accéder aux étudiants ou sessions d'un autre professeur ;
- les sous-niveaux sont installables en production sans doublons ;
- plusieurs sessions du même sous-niveau peuvent coexister ;
- une séance enregistre sa durée et toutes les présences dans une transaction ;
- les totaux d'heures, progression et rémunération sont exacts ;
- une session peut être clôturée avant 30 heures ;
- une session suivante peut reprendre une sélection d'anciens étudiants et accepter de nouveaux étudiants ;
- l'administrateur peut consulter les données sans les modifier ;
- le CRUD Étudiants reprend la structure visuelle de l'ancien CRUD Formules et prix ;
- les tests PHP, l'analyse statique, le lint et la vérification TypeScript passent.

## 15. Hors périmètre de la première version

- connexion ou portail étudiant ;
- notes, examens et certificats ;
- redoublement et décision de passage ;
- emploi du temps hebdomadaire fixe ;
- paiement des étudiants ;
- modification du tarif depuis l'interface ;
- création ou réorganisation des sous-niveaux depuis l'interface ;
- notifications automatiques par email, SMS ou WhatsApp.
