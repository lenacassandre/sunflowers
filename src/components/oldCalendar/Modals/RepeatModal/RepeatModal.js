import React, { Component } from 'react';
import { DropDownSelect, Input, Button } from '../../..';
import { REPEAT_MODAL } from '../../../../views/ReferentTeacherCalendar/RTCalendar.actions';

import './RepeatModal.scss';

export default class RepeatModal extends Component {
	state = { amount: '', frequency: '', unit: 'week', error: null };

	repeat(link) {
		const [amount, frequency] = [this.state.amount, this.state.frequency].map((n) =>
			parseInt(n, 10)
		);

		if (amount > 0 && frequency > 0) {
			this.setState({ error: null }, () =>
				this.props.dispatch({
					type: REPEAT_MODAL.CLICK_BUTTON_REPEAT,
					data: { amount, frequency, unit: this.state.unit, link },
				})
			);
		} else {
			this.setState({ error: 'Veuillez indiquer des informations correctes.' });
		}
	}

	render() {
		const { dispatch } = this.props;

		return (
			<div className="RepeatModal">
				<h2>Répétition</h2>
				{this.state.error && <p className="error">{this.state.error}</p>}
				<div className="inputs">
					<p>Répéter</p>
					<Input
						value={this.state.amount}
						name="Nombre"
						className="amount"
						id={'amount'}
						onChange={(event) => this.setState({ amount: event.target.value })}
					/>
					<p>fois, {this.state.unit === 'week' ? 'toutes' : 'tous'} les</p>
					<Input
						value={this.state.frequency}
						name="Fréquence"
						className="frequency"
						id={'frequency'}
						onChange={(event) => this.setState({ frequency: event.target.value })}
					/>
					<DropDownSelect
						elementsList={['jour', 'semaine']}
						valuesList={['day', 'week']}
						callback={(unit) => this.setState({ unit })}
						active={this.state.unit}
					/>
				</div>
				<div className="buttons">
					<Button
						name="Annuler"
						className="cancelButton"
						click={(event) =>
							dispatch({ type: REPEAT_MODAL.CLICK_BUTTON_CANCEL, event })
						}
						filled
					/>
					<Button
						name="Répéter"
						className="repeatButton"
						click={() => this.repeat(false)}
						filled
					/>
					<Button
						name="Répéter et lier"
						className="repeatLinkButton"
						click={() => this.repeat(true)}
						filled
					/>
				</div>
			</div>
		);
	}
}
