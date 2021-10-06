import React from "react";
import Repository from "./classes/repository.class";
import Document from "./classes/document.class";
import { Promise } from './classes/Promise'

/**
 * N'importe quelle constructeur de classe
 */
export declare type Class<T = any> = { new(...args: any[]): T; }

export declare type Repositories = { [repositoryName: string] : Repository<any, any> }

export declare type Config = {
	username: string;
}

export declare type SocketError<T = {}> = ({error: string} & T)

export declare type ContextType<
	StoreType extends BaseStoreType = BaseStoreType,
	RepositoriesType extends BaseRepositoriesType = BaseRepositoriesType
> = {
	emit: Emit,
	get: <ResponseType = {}>(route: string, body?: any) => Promise<typeof body, ResponseType>,
	post: <ResponseType = {}>(route: string, body?: any, head?: any) => Promise<typeof body, ResponseType>,
	notify: Notify,
	modal: CallModal,
	session: SessionSystem<any>,
	router: RouterSystem<any>,
	repositories: RepositoriesType,
	store: StoreType,
	update: Update<StoreType>,
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

export declare type BaseRepositoriesType = {[repositoryName: string]: Repository<any, any>}

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
	RepositoriesType extends BaseRepositoriesType = BaseRepositoriesType,
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
	view: View<UserClass, StoreType, RepositoriesType, ActionsType>,

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
	RepositoriesType extends BaseRepositoriesType = BaseRepositoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = {
	Main?: ViewComponent<customUserModel, StoreType, RepositoriesType, ActionsType>;
	LeftBar?: ViewComponent<customUserModel, StoreType, RepositoriesType, ActionsType>;
	TopBar?: ViewComponent<customUserModel, StoreType, RepositoriesType, ActionsType>;
	RightBar?: ViewComponent<customUserModel, StoreType, RepositoriesType, ActionsType>;
	BottomBar?: ViewComponent<customUserModel, StoreType, RepositoriesType, ActionsType>;
	store?: StoreType;
	reducer?: Reducer<customUserModel, StoreType, RepositoriesType, ActionsType>;
	actions?: {[actionName: string]: string}
};

// Un composant de vue est un composant React qui reçoit le système de vue
export declare type ViewComponent<
	customUserModel,
	StoreType extends BaseStoreType = BaseStoreType,
	RepositoriesType extends BaseRepositoriesType = BaseRepositoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = React.FC<ViewSystem<customUserModel, StoreType, RepositoriesType, ActionsType>>;

/**
 * Le système de vue qui permet d'interagir avec l'app depuis le reducer ou les composants de vue
 * Tous les composants d'une vue (Main, LeftBar, TopBar, RightBar) reçoivent le ViewSystem en props.
 * Un reducer d'une vue recevra toujours ces éléments en second argument.
 */
export declare type ViewSystem<
	customUserModel,
	StoreType extends BaseStoreType = BaseStoreType,
	RepositoriesType extends BaseRepositoriesType = BaseRepositoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = {
	store: StoreType;

	repositories: RepositoriesType;

	dispatch: Dispatch<ActionsType>;
	update: Update<StoreType>;

	emit: Emit;
	get: <Response = {}>(route: string, body?: any) => Promise<Response, SocketError>
	post: <Response = {}>(route: string, body?: any, head?: any) => Promise<Response, SocketError>

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
	login: (userName: string, password: string) => Promise<void, {error: string}>;

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

export declare type Emit = <ResponseType = {}, ErrorType  = {}>(action: string, data?: any) => Promise<ResponseType, SocketError<ErrorType>>;

export declare type Reducer<
	customUserModel,
	StoreType extends BaseStoreType = BaseStoreType,
	RepositoriesType extends BaseRepositoriesType = BaseRepositoriesType,
	ActionsType extends BaseActionsType = BaseActionsType
> = (
	type: keyof ActionsType,
	action: ActionsType[keyof ActionsType],
	View: ViewSystem<customUserModel, StoreType, RepositoriesType, ActionsType>
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

/**
 * Repositiry Controller Type
 */
export declare type RCType = "post" | "patch" | "remove" | "archive" | "destroy" | "forceDestroy" | "unarchive" | "restore" | "getAll" | "getArchives" | "getRemoved"

// Type d'argument demandé pour appeler une fonction de repo/doc
/**
 * Repositiry Controller Arguments Types
 */
export declare type RCArguments<DocType extends Document> = {
	getAll: undefined,
	getArchives: undefined,
	getRemoved: undefined,
	archive: string[]
	unarchive: string[]
	remove: string[]
	restore: string[]
	forceDestroy: string[]
	destroy: string[]
	patch: (Partial<DocType> & {_id: string})[]
	post: (Partial<DocType> & {_id: string})[]
}

// Type de valeur retournée par une fonction de repo/doc
/**
 * Repositiry Controller Return Types
 */
export declare type RCReturn<DocType extends Document> = {
	getAll: (Partial<DocType> & {_id: string})[],
	getArchives: (Partial<DocType> & {_id: string})[],
	getRemoved: (Partial<DocType> & {_id: string})[],
	archive: string[],
	unarchive: string[],
	remove: string[],
	restore: string[],
	forceDestroy: string[],
	destroy: string[],
	patch: (Partial<DocType> & {_id: string})[],
	post: (Partial<DocType> & {_oldId: string, _id: string})[],
}

// Type d'erreur renvoyé par une fonction de repo/doc
/**
 * Repositiry Controller Error Types
 */
export declare type RCError<DocType extends Document = Document> = {
	getAll: SocketError,
	getArchives: SocketError,
	getRemoved: SocketError,
	archive: SocketError,
	unarchive: SocketError,
	remove: SocketError,
	restore: SocketError,
	forceDestroy: SocketError,
	destroy: SocketError,
	patch: SocketError,
	post: SocketError,
}

export declare type ClientController<ControllerType extends RCType> = (repository: Repository<any, any>, remoteChanges: RCReturn<any>[ControllerType]) => Repository<any, any>