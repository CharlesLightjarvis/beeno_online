# CRUD des examens TELC A1 côté professeur — Plan d’implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre au professeur de créer, consulter, modifier, publier et supprimer ses examens TELC A1 – Lesen avec un éditeur visuel des trois Teile, en respectant l’interface existante.

**Architecture:** Ajouter un domaine Exam avec parties, tâches, supports et choix A/B structurés, protégé par le propriétaire professeur et les policies Laravel. Les pages Inertia/React utilisent les composants communs existants ; le formulaire du Teil 2 présente les deux choix comme des cartes prévisualisées, séparées des contrôles qui saisissent les données et la clé.

**Tech Stack:** Laravel 13 / PHP 8.3, Eloquent et UUID, Form Requests, Policies, Inertia 3, React 19, TypeScript, Tailwind 4, composants UI existants et Wayfinder.

**Spec:** `docs/superpowers/specs/2026-10-02-telc-a1-examens-design.md` — ce plan couvre uniquement le CRUD professeur. La création/lancement des sessions, les écrans étudiants et le temps réel feront l’objet d’un plan ultérieur.

## Global Constraints

- Les examens sont privés à leur professeur propriétaire ; toutes les routes exigent authentification et rôle `teacher`.
- Le modèle A1 Lesen contient trois Teile de cinq tâches : Teile 1 et 3 sont `richtig/falsch`, Teil 2 est `A/B`.
- Un brouillon peut être incomplet ; un examen ne peut être publié que si les trois parties et leurs cinq tâches sont complètes et chaque tâche possède exactement un choix correct.
- Dans l’édition du Teil 2, chaque choix possède une source/en-tête, un titre facultatif et un contenu à lignes multiples. L’aperçu les rend en cartes A/B, côte à côte sur grand écran et empilées sur mobile. Les lettres sont générées, non modifiables.
- Les pages reprennent le shell, les espacements, les tableaux, les formulaires, les boutons, les dialogues de confirmation, les toasts et les breadcrumbs des pages professeur Sessions et Salaires.
- Le professeur ne verra pas questions/choix dans l’écran de passation ; ce lot ne construit pas cet écran.

## Review Focus

- Un professeur ne lit ou ne modifie jamais l’examen d’un autre propriétaire — tests d’accès index/edit/update/delete dans Task 2.
- Des tableaux imbriqués mal formés ou incomplets ne peuvent pas publier un examen — tests brouillon incomplet et publication invalide dans Task 2.
- Les lettres A/B et les formats vrai/faux sont imposés par le Teil, même si le navigateur envoie d’autres labels — test de validation/règle métier dans Task 2.
- Un identifiant de tâche/choix appartenant à un autre examen ne peut pas être réutilisé lors d’une modification imbriquée — test de propriété des enfants dans Task 2.
- Sur petit écran les deux cartes A/B restent lisibles et ne débordent pas — vérification responsive manuelle de l’éditeur dans Task 4.

---

## File Structure

- `app/Enums/ExamStatus.php` — états brouillon/publié.
- `app/Models/Exam.php`, `ExamPart.php`, `ExamReadingMaterial.php`, `ExamTask.php`, `ExamChoice.php` — données, relations et casts.
- `database/migrations/*_create_exams_tables.php` — examens et enfants avec UUID, clés étrangères, ordre et contraintes uniques.
- `database/factories/ExamFactory.php` et factories enfants — fixtures cohérentes pour les tests.
- `app/Enums/PermissionEnum.php`, `RoleEnum.php` — permission professeur `manage.own-exams`.
- `app/Policies/ExamPolicy.php` — accès index/create et contrôle propriétaire pour view/update/delete.
- `app/Http/Requests/Teacher/StoreExamRequest.php`, `UpdateExamRequest.php` — validation des métadonnées et tableaux imbriqués.
- `app/Actions/Teacher/SaveExam.php` — enregistrement atomique de l’examen et de son arbre de parties/tâches/choix.
- `app/Http/Controllers/Teacher/ExamController.php`, `routes/teacher.php` — resource index/create/store/edit/update/destroy.
- `resources/js/pages/teacher/exams/index.tsx`, `create.tsx`, `edit.tsx` — liste et formulaire, avec le layout de Sessions/Salaires.
- `resources/js/pages/teacher/exams/partials/exam-list.tsx`, `columns.tsx` — DataTable, statut et actions de ligne.
- `resources/js/pages/teacher/exams/partials/exam-form.tsx`, `part-editor.tsx`, `task-editor.tsx`, `choice-card-editor.tsx` — formulaire réutilisable, trois Teile et éditeur visuel des cartes.
- `resources/js/types/exam.ts`, `resources/js/types/index.ts` — types Inertia de l’examen et de son arbre.
- `resources/js/components/app-sidebar.tsx` — entrée Examens affichée avec `manage.own-exams`.
- `tests/Feature/Teacher/ExamManagementTest.php` — comportements HTTP, validation, propriétaire et persistance.

## Interfaces entre tâches

- `SaveExam::handle(User $teacher, array $data, ?Exam $exam = null): Exam` crée ou remplace de façon transactionnelle le contenu éditable de l’examen. Les IDs enfants soumis ne sont acceptés que s’ils appartiennent déjà à cet examen.
- Format HTTP imbriqué : `parts[0..2]` avec `part_number`, `instructions`, `reading_materials[]` (`source`, `title`, `body`, `position`), `tasks[]` (`prompt`, `position`, `choices[]`), et les choix (`label`, `source`, `title`, `body`, `is_correct`). Les labels et nombres de choix sont déterminés par le numéro du Teil côté serveur.
- Index retourne `exams` paginé avec `id`, `title`, `status`, `parts_count`, `tasks_count`, `updated_at`. Create/edit retourne `exam` sérialisé dans la même forme que `ExamFormData` TypeScript.

## Tasks

### Task 1: Schéma et relations de l’examen

**Files:**
- Create: `app/Enums/ExamStatus.php`
- Create: `app/Models/Exam.php`, `ExamPart.php`, `ExamReadingMaterial.php`, `ExamTask.php`, `ExamChoice.php`
- Create: migration et factories listées dans File Structure
- Test: `tests/Feature/Teacher/ExamManagementTest.php`

**Interfaces:**
- Produit les relations `Exam::parts()`, `ExamPart::readingMaterials()`, `ExamPart::tasks()`, `ExamTask::choices()` et les factories d’un examen complet.

- [ ] **Step 1: Écrire les tests de persistance et relations** — création d’un examen UUID avec trois Teile, supports liés, quinze tâches et choix ordonnés ; vérifier la contrainte unique sur le numéro du Teil et l’ordre au sein des parents.
- [ ] **Step 2: Exécuter les tests ciblés et vérifier leur échec** — `php artisan test --compact tests/Feature/Teacher/ExamManagementTest.php` ; échec attendu avant schéma/modèles.
- [ ] **Step 3: Ajouter migrations, modèles, enum et factories** — supprimer en cascade uniquement les enfants d’un examen ; conserver les foreign keys et contraintes uniques.
- [ ] **Step 4: Relancer le test ciblé** — les relations et contraintes doivent passer.

### Task 2: Autorisations, validation et CRUD serveur

**Files:**
- Modify: `app/Enums/PermissionEnum.php`, `RoleEnum.php`, `routes/teacher.php`
- Create: `app/Policies/ExamPolicy.php`, `app/Http/Requests/Teacher/StoreExamRequest.php`, `UpdateExamRequest.php`, `app/Actions/Teacher/SaveExam.php`, `app/Http/Controllers/Teacher/ExamController.php`
- Test: `tests/Feature/Teacher/ExamManagementTest.php`

**Interfaces:**
- Consomme les modèles de Task 1.
- Produit les routes `teacher.exams.index/create/store/edit/update/destroy`, les props Inertia `teacher/exams/index|create|edit`, et la sauvegarde atomique `SaveExam::handle(...)`.

- [ ] **Step 1: Écrire les tests HTTP** — teacher peut créer un brouillon, lire la liste paginée, modifier/supprimer le sien ; autre teacher ne peut ni lire ni changer l’examen ; étudiant/admin/non authentifié refusés selon middleware.
- [ ] **Step 2: Écrire les tests de validation** — brouillon incomplet autorisé ; publication exige trois Teile et cinq tâches chacune ; Teil 1/3 impose vrai/faux, Teil 2 impose A/B, exactement un `is_correct` par tâche ; IDs d’enfants étrangers rejetés ; seules les données validées persistent.
- [ ] **Step 3: Exécuter les tests ciblés et vérifier leur échec** — `php artisan test --compact tests/Feature/Teacher/ExamManagementTest.php`.
- [ ] **Step 4: Implémenter permission, policy, Form Requests, action transactionnelle, contrôleur et routes resource** — index limité à `$request->user()->exams()` ; autoriser chaque enfant selon son examen parent ; publier un toast après succès ; supprimer un examen non référencé et ses enfants.
- [ ] **Step 5: Relancer le test ciblé** — tous les scénarios HTTP, validation et propriété doivent passer.

### Task 3: Liste des examens et navigation professeur

**Files:**
- Create: `resources/js/pages/teacher/exams/index.tsx`, `partials/exam-list.tsx`, `partials/columns.tsx`
- Modify: `resources/js/components/app-sidebar.tsx`, `resources/js/types/exam.ts`, `resources/js/types/index.ts`
- Generated: routes Wayfinder sous `resources/js/routes/teacher/exams/`

**Interfaces:**
- Consomme la prop paginée `exams` du contrôleur.
- Produit une liste DataTable avec colonnes titre, statut, nombre de tâches, dernière modification et actions modifier/supprimer.

- [ ] **Step 1: Créer les types TypeScript** correspondant à l’index paginé et au statut `draft | published`.
- [ ] **Step 2: Créer la page et la liste** — reprendre `teacher/sessions/index.tsx`, `SessionList` et les colonnes de sessions ; utiliser le DataTable, filtres, pagination, DropdownMenu, ConfirmActionDialog et toast existants.
- [ ] **Step 3: Ajouter l’item Examens** dans la sidebar avec la permission `manage.own-exams` et générer les routes Wayfinder.
- [ ] **Step 4: Vérifier les types et le rendu de navigation** — la table présente état vide, état rempli, actions et pagination sans erreurs TypeScript.

### Task 4: Formulaire de création/modification et aperçu A/B

**Files:**
- Create: `resources/js/pages/teacher/exams/create.tsx`, `edit.tsx`, `partials/exam-form.tsx`, `part-editor.tsx`, `task-editor.tsx`, `choice-card-editor.tsx`
- Modify: `resources/js/types/exam.ts`, `resources/js/types/index.ts`

**Interfaces:**
- Consomme `ExamFormData` et soumet les tableaux imbriqués définis plus haut aux routes store/update.
- `ChoiceCardEditor` reçoit un choix A ou B et édite `source`, `title`, `body`; il affiche la prévisualisation en carte. Le contrôle de la clé sélectionne A ou B à part et n’est jamais inclus dans la prévisualisation destinée à l’étudiant.

- [ ] **Step 1: Créer le formulaire partagé create/edit** avec titre, statut brouillon/publié, navigation entre Teil 1/2/3, consignes, supports et cinq tâches configurées par partie.
- [ ] **Step 2: Construire l’éditeur de tâche** — Teil 1 et 3 ont deux choix fixes richtig/falsch ; Teil 2 a un prompt et deux choix fixes A/B.
- [ ] **Step 3: Créer l’éditeur A/B visuel** — deux cartes encadrées avec label immuable, source en en-tête, titre facultatif et contenu multiligne ; aperçu côte à côte sur bureau, empilé sur mobile ; afficher les erreurs Laravel au niveau du champ correspondant.
- [ ] **Step 4: Ajouter l’édition de la clé et les actions de liste dynamique** — un seul choix correct par tâche, ajouter/supprimer/réordonner les supports et tâches si le statut est brouillon ; désactiver la publication tant que les règles des 15 tâches ne sont pas satisfaites et montrer les erreurs de validation serveur.
- [ ] **Step 5: Connecter les formulaires Inertia** avec les routes Wayfinder, valeurs initiales create/edit, états processing, toasts, boutons et breadcrumbs conformes aux pages professeur existantes.
- [ ] **Step 6: Vérifier les types et faire une revue responsive** sur largeur téléphone et bureau ; les cartes, contrôles, erreurs et actions doivent rester lisibles sans débordement.

### Task 5: Vérification intégrée du lot CRUD

**Files:**
- Modify si requis : fichiers des Tasks 1–4
- Test: `tests/Feature/Teacher/ExamManagementTest.php`

- [ ] **Step 1: Compléter les parcours feature** — création via formulaire HTTP, réouverture edit avec les valeurs saisies, mise à jour imbriquée sans doublonner les enfants, suppression avec confirmation côté UI et suppression persistée côté serveur.
- [ ] **Step 2: Relancer la suite feature CRUD** — `php artisan test --compact tests/Feature/Teacher/ExamManagementTest.php` doit passer.
- [ ] **Step 3: Vérifier les contrôles projet** — `npm run types:check`, `npm run lint:check`, `php artisan wayfinder:generate --with-form` puis vérifier que le diff généré est limité aux routes Exams.
- [ ] **Step 4: Revue visuelle manuelle** — comparer liste/formulaires aux pages Sessions et Salaires ; contrôler les états vide/erreur/sauvegarde, le layout desktop/mobile, les cartes A/B et la confirmation de suppression.
