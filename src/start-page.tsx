import { IJSLComponent, IJSLVNode } from "jsl-render";

export class StartPage implements IJSLComponent {

    public render(): IJSLVNode {
        return <div>
            <a href="#dice" class="nw-button nw-button-stretch">Würfel</a>
            <a class="nw-button nw-button-stretch">...</a>
        </div>;
    }

}
