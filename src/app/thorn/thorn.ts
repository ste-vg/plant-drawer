import { TweenLite, Power1 } from "gsap";
import { Position } from "../Position";

export class Thorn
{
    
    private thorn:SVGPathElement;

    constructor(stage:HTMLElement, position: Position, size:number)
    {
        console.log('thorn')
        this.thorn = document.createElementNS("http://www.w3.org/2000/svg", 'path')
            this.thorn.setAttribute('d', this.createThornPath({x: 0, y: 0}, size))
            this.thorn.setAttribute('class', 'thorn')
            this.thorn.style.fill = '#646F4B';
            this.thorn.style.stroke = 'none';

        TweenLite.set(this.thorn, {scale:0, x: position.x, y: position.y, rotation: Math.random() * 360})
        TweenLite.to(this.thorn, 3, {scale:1})
        
        stage.appendChild(this.thorn);
    }

    private createThornPath(p:Position, w:number):string
    {
        let path = `M ${p.x} ${p.y} Q ${p.x - w / 2} ${p.y}  ${p.x - w / 2} ${p.y + w / 4} L ${p.x} ${p.y + w * 2} L ${p.x + w / 2} ${p.y + w / 4} Q ${p.x + w / 2} ${p.y} ${p.x} ${p.y} Z`  
       // console.log(path)
        return path;
    }

    public clear()
    {
        this.thorn.remove();
    }

   
}