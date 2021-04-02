import React from "react";
import Factory from "./components/ViewComposer/classes/factory.class";

/**
 * N'importe quelle constructeur de classe
 */
export declare type Class<T = any> = { new(...args: any[]): T; }

export declare type Factories = { [factoryName: string] : Factory<any, any> }

export declare type Config = {
	username: string;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
// DEFAULT
export declare type BaseActionsType = {
	[action: string]: {
		[prop: string]: any
	}
}

export declare type BaseStoreType = {
	[key: string]: any
}

export declare type BaseFactoriesType = {[factoryName: string]: Factory<any, any>}

////////////////////////////////////////////////////////////////////////////////////////////////////:
////////////////////////////////////////////////////////////////////////////////////////////////////:
////////////////////////////////////////////////////////////////////////////////////////////////////:
////////////////////////////////////////////////////////////////////////////////////////////////////:
////////////////////////////////////////////////////////////////////////////////////////////////////:
// View
export declare type ViewsTree<UserClass> = Array<ViewDeclaration<UserClass, any, any, any>>

export declare type ViewDeclaration<
	UserClass,
	StoreType extends BaseStoreType = BaseStoreType,
	FactoriesType extends BaseFactoriesType = BaseFactoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = {
	// URL
	path: string | string[];

	// HTML Title
	title: string;

	// Display name for the menu. If none is given, the view does not appear in the menu.
	// If there is only a label, it becomes a category's title
	label?: string;

	// Composant de la vue;
	view: View<UserClass, StoreType, FactoriesType, ActionsType>,

	// Une seule vue peut avoir cette propriété. Ce sera celle sur laquelle seront revoyés les utilisateurs pour
	// lesquels le routeur ne trouve aucune vue.
	default?: boolean;

	// S'il est obligatoire d'être authentifié pour accéder à la vue.
	auth?: boolean;

	// Classe du conteneur de la vue
	className?: string;

	// Si cette propriété est spécifiée, seuls les utilisateur·ices qui ont le bon rôle pourront accéder à la vue
	roles?: number[]
}


/**
 * Une vue est composée d'un ou plusieurs composants JSX de vue (Main, LeftBar, TopBar, RightBar) et de composantes de logique (store, viewmodel, actions, reducer).
 * Le type View représente ce que l'on attends d'un fichier de vue.
 * Ce ne sont pas les props d'une vue. Celles ci sont listée dans ViewSystem.
 */
 export declare type View<
	customUserModel,
	StoreType extends BaseStoreType = BaseStoreType,
	FactoriesType extends BaseFactoriesType = BaseFactoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = {
	Main?: ViewComponent<customUserModel, StoreType, FactoriesType, ActionsType>;
	LeftBar?: ViewComponent<customUserModel, StoreType, FactoriesType, ActionsType>;
	TopBar?: ViewComponent<customUserModel, StoreType, FactoriesType, ActionsType>;
	RightBar?: ViewComponent<customUserModel, StoreType, FactoriesType, ActionsType>;
	BottomBar?: ViewComponent<customUserModel, StoreType, FactoriesType, ActionsType>;
	store?: StoreType;
	reducer?: Reducer<customUserModel, StoreType, FactoriesType, ActionsType>;
	actions?: {[actionName: string]: string}
};

// Un composant de vue est un composant React qui reçoit le système de vue
export declare type ViewComponent<
	customUserModel,
	StoreType extends BaseStoreType = BaseStoreType,
	FactoriesType extends BaseFactoriesType = BaseFactoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = React.FC<ViewSystem<customUserModel, StoreType, FactoriesType, ActionsType>>;

/**
 * Le système de vue qui permet d'interagir avec l'app depuis le reducer ou les composants de vue
 * Tous les composants d'une vue (Main, LeftBar, TopBar, RightBar) reçoivent le ViewSystem en props.
 * Un reducer d'une vue recevra toujours ces éléments en second argument.
 */
export declare type ViewSystem<
	customUserModel,
	StoreType extends BaseStoreType = BaseStoreType,
	FactoriesType extends BaseFactoriesType = BaseFactoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = {
	store: StoreType;
	factories: FactoriesType;

	dispatch: Dispatch<ActionsType>;
	update: Update<StoreType>;
	emit: Emit;

	modal: CallModal;
	notify: Notify;

	session: SessionSystem<customUserModel>;

	router: RouterSystem<customUserModel>
};

///////////////////////////////////////////////////////////////////////////////////////////////////////::
///////////////////////////////////////////////////////////////////////////////////////////////////////::
///////////////////////////////////////////////////////////////////////////////////////////////////////::
///////////////////////////////////////////////////////////////////////////////////////////////////////::
///////////////////////////////////////////////////////////////////////////////////////////////////////::
// HOOKS

export declare type SessionSystem<customUserModel> = {
	user: customUserModel | null;
	token: string | null;

	logout: () => void;
	login: (userName: string, password: string) => Promise<void>;

	saveUser: (user: customUserModel) => void;
	saveToken: (token: string) => void;
	saveSession: (token: string, user: customUserModel) => void;
};

export declare type RouterSystem<UserType> = {
	navigate: (path: string, params?: {[key:string ]: string}) => void;
	path: string;
	params: {[key:string ]: string};
	_currentViewDeclaration: ViewDeclaration<UserType, any>
}

export declare type Dispatch<
	ActionsType extends BaseActionsType = BaseActionsType
> = <Key extends keyof ActionsType = any>(type: Key, action: ActionsType[Key]) => void;

export declare type Update<StoreType> = (updates: {[key in keyof StoreType]?: StoreType[key] }) => void;

export declare type Emit = <ResponseType = {}>(action: string, data?: any) => Promise<ResponseType>;

export declare type Reducer<
	customUserModel,
	StoreType extends BaseStoreType = BaseStoreType,
	FactoriesType extends BaseFactoriesType = BaseFactoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = (
	type: keyof ActionsType,
	action: ActionsType[keyof ActionsType],
	View: ViewSystem<customUserModel, StoreType, FactoriesType, ActionsType>
) => Partial<StoreType> | undefined | void;

export declare type Navigate = (path: string, params?: {[key: string]: string}) => void

//////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////:
// MODALS /////////////////////////////////////////////////////////////////////////////////////////////////

export declare type CallModal = <FormType = {}>(modalArg: ModalDeclaration | ModalForm) => Promise<FormType>;
/// <reference path="./locale/index.d.ts" />

export declare type ModalDeclaration = {
	title?: string;
	message?: string | JSX.Element;
	resolveButton?: string;
	rejectButton?: string;
	form?: ModalForm;
	className?: string;
	raw?: boolean; // if true, does not apply the default style of the modal
	delay?: number;
}

export declare type ModalObject = ModalDeclaration & {
	reject?: (data?: any) => void;
	resolve?: (data?: any) => void;
	close: (resolving?: boolean) => void;
	resolving?: boolean; // if the modal is closing while being resolved
};

export declare type ModalForm = ((resolve: (data: any) => void, reject: (data?: any) => void) => JSX.Element) | JSX.Element

export declare type Modals = ModalObject[];

///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTIFICATIONS /////////////////////////////////////////////////////////////////////////////////////////:

export declare type Notify = (message: string, color?: string) => void;

export declare type NotificationObject = {
	id: number;
	content: string;
	color: string;
	closing: "manual" | "auto";
	close: () => void;
};

export declare type Notifications = NotificationObject[];

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
