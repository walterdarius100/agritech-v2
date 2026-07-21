# Guide admin CRM Agri-tech

Ce guide explique comment utiliser le CRM interne depuis **/admin/suivi**. Le CRM est réservé à l'équipe Agri-tech : il ne modifie pas les formulaires publics Contact, Consultation, Academy, Certificats, emails ou paiements.

## 1. Voir les nouveaux dossiers

1. Ouvrir `/admin/suivi`.
2. Consulter le résumé en haut de page, notamment **Nouveaux dossiers** et **À traiter**.
3. Utiliser le filtre **Statut = Nouveau** pour isoler les demandes fraîchement créées.
4. Cliquer sur l'ID dossier pour ouvrir la fiche détail.

## 2. Qualifier un dossier

Un dossier est à qualifier lorsque l'équipe doit comprendre le besoin réel, le budget, la localisation, l'urgence et la capacité du prospect à avancer.

Workflow recommandé :

```txt
Nouveau → À qualifier
```

Actions recommandées :

- vérifier le nom, téléphone et email ;
- préciser le type de projet et la localisation ;
- ajouter une note interne ;
- définir une prochaine action claire ;
- ajuster la priorité et le niveau d'intérêt.

## 3. Planifier une réunion

Utiliser ce statut lorsque le prospect est suffisamment qualifié et qu'un échange structuré doit être organisé.

Workflow recommandé :

```txt
À qualifier → Réunion à planifier → Réunion prévue
```

Actions recommandées :

- renseigner **Prochaine action** : par exemple “Confirmer créneau WhatsApp” ;
- renseigner **Date prochaine action** ;
- compléter la date/heure de réunion dans la fiche ;
- ajouter une interaction de type `appel`, `whatsapp` ou `reunion` après chaque échange.

## 4. Envoyer une proposition

Après réunion ou analyse du besoin, passer le dossier en préparation de proposition.

Workflow recommandé :

```txt
Réunion prévue → Proposition à préparer → Proposition envoyée
```

Actions recommandées :

- noter les besoins validés ;
- indiquer le montant proposé si disponible ;
- renseigner la date d'envoi de proposition ;
- ajouter une interaction de type `proposition` avec un résumé court.

## 5. Programmer une relance

Une relance doit toujours avoir une prochaine action datée pour éviter les oublis.

Workflow recommandé :

```txt
Proposition envoyée → Relance 1 → Relance 2
```

Actions recommandées :

- définir **Prochaine action** : “Relancer sur WhatsApp”, “Appeler”, etc. ;
- définir **Date prochaine action** ;
- ajouter une interaction après chaque relance ;
- utiliser la vue **À traiter** pour repérer les actions du jour ou en retard.

## 6. Clôturer gagné ou perdu

Clôturer un dossier lorsque l'issue est claire.

Workflow recommandé :

```txt
Relance 2 → Gagné / Perdu
```

Utiliser :

- **Gagné** si le prospect devient client ou confirme l'accompagnement ;
- **Perdu** si le prospect refuse, n'a pas le budget, choisit une autre option ou ne souhaite plus avancer ;
- **Archivé** pour un dossier interne à conserver sans action commerciale.

Les dossiers `gagne`, `perdu` et `archive` ne doivent pas générer d'alerte de relance inutile.

## 7. Ajouter une note ou une interaction

Dans la fiche détail :

1. Aller à **Ajouter une interaction**.
2. Choisir le type : `note`, `appel`, `whatsapp`, `email`, `reunion`, `relance`, `proposition`, `paiement`, `decision` ou `autre`.
3. Choisir le canal si utile : téléphone, WhatsApp, email, site web, réunion, Facebook, Instagram ou autre.
4. Renseigner un résumé court obligatoire.
5. Ajouter les détails internes si nécessaire.
6. Enregistrer.

Chaque interaction met à jour **Dernière interaction** et influence le calcul des jours sans interaction.

## 8. Suivre les alertes

La vue **À traiter** priorise les dossiers qui nécessitent une action.

Badges possibles :

- **Action aujourd’hui** : une action est prévue aujourd'hui ;
- **En retard** : la date de prochaine action est dépassée ;
- **À relancer** : aucune interaction depuis au moins 7 jours ;
- **Aucune prochaine action** : dossier actif sans action planifiée ;
- **Priorité urgente** : dossier marqué urgent.

Priorité de traitement recommandée :

1. dossiers **En retard** ;
2. dossiers **Priorité urgente** ;
3. actions prévues aujourd'hui ;
4. dossiers sans interaction depuis 7 jours ;
5. dossiers actifs sans prochaine action.

## Workflow recommandé complet

```txt
Nouveau
→ À qualifier
→ Réunion à planifier
→ Réunion prévue
→ Proposition à préparer
→ Proposition envoyée
→ Relance 1
→ Relance 2
→ Gagné / Perdu
```

## Bonnes pratiques

- Ne jamais stocker dans les notes des informations inutiles ou trop sensibles.
- Garder les résumés d'interactions courts et exploitables.
- Toujours renseigner une prochaine action pour les dossiers actifs.
- Utiliser `Perdu` ou `Archivé` dès qu'un dossier ne doit plus être relancé.
- Vérifier régulièrement la vue **À traiter**.
