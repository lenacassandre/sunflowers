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
            repositories={models}
            UserModel={User}
            socketURL="http://127.0.0.1:3001"
        />
    )
}