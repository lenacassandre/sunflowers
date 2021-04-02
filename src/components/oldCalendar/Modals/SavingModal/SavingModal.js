import React, { useState } from 'react';
import './SavingModal.scss';

import { Input, Button } from '../../../';
import Task from '../../Task/Task';
import { SAVE_AS_TEMPLATE_MODAL } from '../../../../views/ReferentTeacherCalendar/RTCalendar.actions';

export default function SavingModal({ store, dispatch }) {
    const task = store.tasksArray.find((t) => t.id === store.editor);
    const [title, setTitle] = useState(task.title);
    const [error, setError] = useState(false);

    function handleChange(event) {
        const value = event.target.value;
        if (value.length > 0) {
            setTitle(value);
            setError(null);
        } else {
            setTitle('');
            setError('Veuillez indiquer un nom.');
        }
    }

    function save() {
        if (
            store.user.templates &&
            store.user.templates.some((t) => t.title.toLowerCase() === title.toLowerCase())
        ) {
            setError('Ce nom est déjà pris');
        } else if (title && title.length > 0) {
            setError(null);
            dispatch({ type: SAVE_AS_TEMPLATE_MODAL.CLICK_BUTTON_SAVE, data: title });
        } else {
            setError('Veuillez indiquer un nom.');
        }
    }

    return (
        <div className="SavingModal">
            <Task task={{ ...task, date: null }} store={store} template />
            <div className="savingModalInputs">
                <Input name="Nom du modèle" value={title} onChange={handleChange} />
                {error && <p className="error">{error}</p>}
                <div className="savingModalButtons">
                    <Button
                        name="Annuler"
                        click={(event) =>
                            dispatch({ type: SAVE_AS_TEMPLATE_MODAL.CLICK_BUTTON_CANCEL, event })
                        }
                    />
                    <Button name="Enregistrer" click={save} />
                </div>
            </div>
        </div>
    );
}
