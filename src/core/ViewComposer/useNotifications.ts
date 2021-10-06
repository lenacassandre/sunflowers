import { useState, useRef } from "react";

import { Notify, Notifications } from "../../types";

import generateNewID from "../../utils/generateNewID";

import log from "../../utils/log";

export default function useNotifications(): [Notifications, Notify] {
	log.useNotificationsGroup();

	// Système intégré de notifications
	const defaultNotificationsList: any[] = [];
	const [notificationsList, setNotificationsList] = useState(defaultNotificationsList);
	const notifsRef = useRef(notificationsList);
	notifsRef.current = notificationsList;

	// Ajoute une notification au tableau des notifications
	function notify(content: string, color?: string) {
		if(!(typeof content === "string")) {
			console.error("Notification content must be type of string.", content)
			return;
		}

		// Génère un nouvel identifiant unique pour la notification
		const newID = generateNewID(notifsRef.current);

		// Prévoit sa fermeture après 5 secondes
		setTimeout(deleteNotification, 5000, newID);

		// Copie du tableau de notifs actuel afin d'y effectuer des opérations
		const newNotifsList = [...notifsRef.current];
		// Ajout au début du tableau d'une nouvelle notification.
		// L'id précédemment généré, le contenu passé en argument, et le mode de fermeture : 'auto' (pour l'animation).
		newNotifsList.unshift({
			id: newID,
			content: content,
			closing: "auto",
			color: color ? color : "blue",
			close: () => closeNotification(newID),
		});

		// Si le tableau de notification dépasse les 5 notifs, on supprime la plus vieille notif.
		if (newNotifsList.length > 5) {
			newNotifsList.pop();
		}

		// Mise à jour du tableau et render.
		setTimeout(() => setNotificationsList(newNotifsList), 0);
	}

	// Suppression d'une notification du tableau
	function deleteNotification(id: number) {
		// Copie du tableau de notifs pour effectuer des opérations
		const newNotifsList = [...notifsRef.current];

		// Trouve l'index de la notification à supprimer dans le tableau.
		const indexToDelete = newNotifsList.findIndex((n) => n.id === id);

		// S'il est trouvé
		if (indexToDelete >= 0) {
			// Coupe le tableau à l'endroit à supprimer
			newNotifsList.splice(
				newNotifsList.findIndex((n) => n.id === id),
				1
			);

			// Met à jour le tableau de notifs, et render.
			setNotificationsList(newNotifsList);
		}
	}

	// Fermetutre manuelle d'une notification
	function closeNotification(id: number) {
		// Copie du tableau pour exécuter une opération dessus
		const newNotifsList = [...notifsRef.current];

		// Changement de mode de fermeture de la notification => manual
		newNotifsList.find((n) => n.id === id).closing = "manual";

		// Mise à jour du tableau des notifications et render.
		setNotificationsList(newNotifsList);

		// Suppression de la notification juste après le render qu'implique l'instruction précédente
		setTimeout(deleteNotification, 0, id);
	}

	log.useNotificationsGroupEnd("NOTIFICATIONS");

	return [notifsRef.current, notify];
}
