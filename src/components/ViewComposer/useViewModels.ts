/*import { useState, useRef } from "react";
import { View, Repository } from "../../types";

import log from "../../utils/log";

export default function useViewModels(currentView: View, repositories: any) {
	log.useViewmodelGroup();

	log.useViewmodel("Repositories", repositories);

	const viewModel: { [modelName: string]: Repository<any> } = {};

	if (currentView.viewmodel) {
		for (const requestedRepository in currentView.viewmodel) {
			if (repositories[requestedRepository]) {
				viewModel[requestedRepository] = repositories[requestedRepository];
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