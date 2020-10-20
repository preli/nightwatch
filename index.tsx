import {IJSLComponent, IJSLVNode, JSLRender} from "jsl-render";
import { StartPage } from "./src/start-page";
import { DicePage } from "./src/dice-page";
import {JSLRoute } from "jsl-route";

const renderer = new JSLRender(document.body, true);

const routes = {
    "": () => {
        renderer.render(new StartPage());
    },
    "dice": () => {
        renderer.render(new DicePage());
    }
};


class NotFoundComponent implements IJSLComponent {
    public render(): IJSLVNode {
        return <h1>Falsche Adresse</h1>;
    }
}


JSLRoute.setup(routes, (params) => {
    renderer.render(new NotFoundComponent());
});
