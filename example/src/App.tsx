import React from "react";
import { ViewComposer } from "../../src";

import models from "./models"
import { User } from "./models/User.model";

import views from './views'

export default function App() {
    return (
        <ViewComposer<User>
            views={views}
            defaultView={views[0]}
            factories={models}
            UserModel={User}
            socketURL=""
        />
    )
}