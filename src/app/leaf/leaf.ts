import { TweenMax, Power1, Elastic } from "gsap";
import { Position } from "../Position";

export class Leaf
{
    leaf:SVGPathElement;

    constructor(stage:HTMLElement, position: Position, size:number)
    {
        
        this.leaf = document.createElementNS("http://www.w3.org/2000/svg", 'path')
            this.leaf.setAttribute('d', this.createLeafPath({x: 0, y: 0}, size))
            this.leaf.setAttribute('class', 'leaf')
            this.leaf.style.fill = this.getColor();
            this.leaf.style.stroke = 'none';

        let rotate = Math.random() * 360;
        let rotateGrow = (Math.random() * 180) - 90;

        TweenMax.set(this.leaf, {scale:0, x: position.x, y: position.y, rotation: rotate})
        TweenMax.to(this.leaf, 4, {scale:1})
        TweenMax.to(this.leaf, 6, {rotation: rotate + rotateGrow, ease: Elastic.easeOut})
        
        stage.appendChild(this.leaf);
    }

    private createLeafPath(p: Position, size: number):string
    {
        let top = size * (3 + Math.random() * 2);
        let middle = size * (1 + Math.random());
        let width = size * (1.5 + Math.random() * 0.5);
        let path = `M ${p.x} ${p.y} Q ${p.x - width} ${p.y + middle}  ${p.x} ${p.y + top} Q ${p.x + width} ${p.y + middle} ${p.x} ${p.y} Z`  
        return path;
    }

    private getColor():string
    {
        let greens = ['#00A676', '#00976C', '#008861', '#007956']
        return greens[Math.floor(Math.random() * greens.length)];
    }

    public clear()
    {
        this.leaf.remove()
    }
}