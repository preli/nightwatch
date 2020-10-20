import "./dice-page.scss";
import { IJSLComponent, IJSLVNode } from "jsl-render";

export class DicePage implements IJSLComponent {

    private result: string;

    public render(): IJSLVNode {
        return <div class="dice-page">
            <h1>Wüfel</h1>
            {this.result ? <div class="result">{this.result}</div> : <div></div>}

            {[20,12,10,8,6,4].map((nr) => {
                return <div>
                <button class="nw-button" click={() => {
                    const el = document.getElementById("timesd" + nr) as HTMLInputElement;
                    const times = parseInt(el.value, 10);
                    if (times < 20) {
                        el.value = (times + 1).toString();
                    }
                }}>^</button>
                <button class="nw-button" click={() => {
                    const el = document.getElementById("timesd" + nr) as HTMLInputElement;
                    const times = parseInt(el.value, 10);
                    if (times > 1) {
                        el.value = (times - 1).toString();
                    }
                }}>v</button>
                <input id={"timesd" + nr} type="text" class="numeric" value="1" />
                <button class="nw-button" click={() => {
                    const times = parseInt((document.getElementById("timesd" + nr) as HTMLInputElement).value, 10);
                    this.generateResult(times, nr);
                }}>{"d" + nr}</button>
            </div>;
            })}
            

        </div>;
    }

    public generateResult(times: number, nr: number): void {
        if (times === 1) {
            this.result = this.rand(nr).toString();
            return;
        }
        this.result = "";
        let sum = 0;
        for (let i = 0; i < times; i++) {
            if (this.result) {
                this.result += "+";
            }
            const randNr = this.rand(nr);
            this.result += randNr;
            sum += randNr;
        }
        this.result += " = " + sum;
    }

    private rand(max: number): number {
        return Math.floor(Math.random() * max) + 1;
    }

}
