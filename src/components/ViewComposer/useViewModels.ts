/*import { useState, useRef } from "react";
import { View, Factory } from "../../types";

import log from "../../utils/log";

export default function useViewModels(currentView: View, factories: any) {
	log.useViewmodelGroup();

	log.useViewmodel("Factories", factories);

	const viewModel: { [modelName: string]: Factory<any> } = {};

	if (currentView.viewmodel) {
		for (const requestedFactory in currentView.viewmodel) {
			if (factories[requestedFactory]) {
				viewModel[requestedFactory] = factories[requestedFactory];
			}
		}
	}

	log.useViewmodelGroupEnd("VIEW MODEL");

	return viewModel;
}

*/

export default function fakefunction(): void {
	return
}