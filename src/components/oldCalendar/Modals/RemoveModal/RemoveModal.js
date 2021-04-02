import React, { useState } from "react";
import "./RemoveModal.scss";

import Task from "../../Task/Task";
import { CheckBox, Button } from "../../..";

import {
  REMOVE_MODAL,
  USER,
} from "../../../../views/ReferentTeacherCalendar/RTCalendar.actions";

export default function RemoveModal({ store, dispatch }) {
  return (
    <div className="RemoveModal">
      <Task
        store={store}
        task={store.tasksArray.find((t) => t._id === store.editing)}
        template
      />
      <div className="rightContainer">
        <p>Souhaitez-vous supprimer cet élément définitivement ?</p>
        <CheckBox
          label="Ne plus me demander"
          active={store.user.skipRemoveModal}
          callback={(checked) => store.user.patch({ skipRemoveModal: checked })}
        />
        <div className="removeModalButtons">
          <Button
            name="Annuler"
            className="cancelButton"
            click={() => dispatch({ type: REMOVE_MODAL.CLICK_BUTTON_CANCEL })}
          />
          <Button
            name="Confirmer"
            className="confirmButton"
            click={() => dispatch({ type: REMOVE_MODAL.CLICK_BUTTON_CONFIRM })}
          />
        </div>
      </div>
    </div>
  );
}
