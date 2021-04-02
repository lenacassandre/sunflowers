import React from 'react';
import './BrushModal.scss';

import Task from '../../Task/Task';
import { Button } from '../../../';
import { BRUSH_MODAL } from '../../../../views/ReferentTeacherCalendar/RTCalendar.actions';

export default function BrushModal({ store, dispatch }) {
	return (
		<div className="BrushModal">
			<div className="templatesContainer">
				{store.user.templates && store.user.templates.length > 0 ? (
					store.user.templates.map((template) => (
						<Task
							key={template.title}
							store={store}
							task={template.task}
							template
							onClick={(event) =>
								dispatch({
									type: BRUSH_MODAL.PICK_TEMPLATE,
									event,
									data: template.title,
								})
							}
						/>
					))
				) : (
					<p>Aucun modèle enregistré</p>
				)}
			</div>
			<Button name="Annuler" click={() => dispatch({ type: BRUSH_MODAL.CANCEL })} />
		</div>
	);
}
