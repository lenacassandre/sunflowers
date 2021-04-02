import React from 'react';
import './LinkModal.scss';
import Task from '../../Task/Task';
import Button from '../../../Button/Button';

import { LINK_MODAL } from '../../../../views/ReferentTeacherCalendar/RTCalendar.actions';
import { CheckBoxes } from '../../..';

export default function LinkModal({ store, dispatch }) {
	const link = store.links.find((l) => l.items.includes(store.editing));
	const taskLink = store.tasksArray.find((task) => task.id === store.editing).link;

	const keys = [
		{ label: 'Intitulé', id: 'title', active: taskLink.title },
		{ label: 'Type', id: 'type', active: taskLink.type },
		{ label: 'Date limite', id: 'deadline', active: taskLink.deadline },
		{ label: 'Heure', id: 'hour', active: taskLink.hour },
		{ label: 'Durée', id: 'duration', active: taskLink.duration },
		{ label: 'Professeur', id: 'teacher', active: taskLink.teacher },
		{ label: 'Promotions', id: 'promotion', active: taskLink.promotion },
		{ label: 'Groupes', id: 'group', active: taskLink.group },
		{ label: 'UF', id: 'uf', active: taskLink.uf },
		{ label: 'Description', id: 'description', active: taskLink.description },
	];

	if (link) {
		const linkedTasks = store.tasksArray.filter((task) => link.items.includes(task.id));

		return (
			<div className="LinkModal">
				<div className="items">
					{linkedTasks.map((task) => (
						<Task
							key={task.id}
							task={task}
							store={store}
							template
							onClick={(event) =>
								dispatch({ type: LINK_MODAL.SWITCH_TASK, event, data: task.id })
							}
						/>
					))}
				</div>
				<div className="keys">
					<CheckBoxes
						array={keys}
						callback={(checkedArray) =>
							dispatch({ type: LINK_MODAL.CHANGE_LINKED_KEYS, data: checkedArray })
						}
					/>
					<Button
						click={() => dispatch({ type: LINK_MODAL.COPY_LINK })}
						name="Appliquer à tous les objets liés"
						className="copyLinkButton"
						filled
					/>
					<Button
						click={() => dispatch({ type: LINK_MODAL.CLICK_BUTTON_SAVE })}
						name="Enregistrer"
						className="saveButton"
						filled
					/>
				</div>
			</div>
		);
	} else {
		return <div></div>;
	}
}
