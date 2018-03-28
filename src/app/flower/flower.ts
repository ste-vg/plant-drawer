import { TweenMax, Power1, Elastic } from "gsap";
import { Position } from "../Position";
import { FlowerColors } from "./FlowerColors";

export class Flower
{
    petals:SVGPathElement[] = [];

    constructor(stage:HTMLElement, position: Position, size:number, colors:FlowerColors)
    {
        //outer petals

        let petalCount = 8;
        let p = petalCount;
        let rotateAmount = 360 / petalCount;
        let growRotation = (Math.random() * 80) - 40;

        while(p > 0)
        {
            --p;
            let petal = document.createElementNS("http://www.w3.org/2000/svg", 'path')
                petal.setAttribute('d', this.createPetalPath({x: 0, y: 0}, size))
                petal.setAttribute('class', 'petal')
                petal.style.fill = colors.outer;
                petal.style.stroke = 'none';

            this.petals.push(petal);
            let rotate = (rotateAmount * p) + Math.random() * 40;
            

            TweenMax.set(petal, {scale:0, x: position.x, y: position.y, rotation: rotate})
            let delay = Math.random();
            TweenMax.to(petal, 3, {scale:1, delay: delay})
            TweenMax.to(petal, 6, {rotation: '+=' + growRotation, delay: delay, ease: Elastic.easeOut})
            
            stage.appendChild(petal);
        }

        // inner petals

        petalCount = 6;
        p = petalCount;
        rotateAmount = 360 / petalCount;
        while(p > 0)
        {
            --p;
            let petal = document.createElementNS("http://www.w3.org/2000/svg", 'path')
                petal.setAttribute('d', this.createPetalPath({x: 0, y: 0}, size / 2))
                petal.setAttribute('class', 'petal')
                petal.style.fill = colors.inner;
                petal.style.stroke = 'none';

            this.petals.push(petal);
            let rotate = (rotateAmount * p) + Math.random() * 45;
            let growRotation = (Math.random() * 80) - 40;

            TweenMax.set(petal, {scale:0, x: position.x, y: position.y, rotation: rotate})
            TweenMax.to(petal, 12, {scale:1, rotation: '+=' + growRotation, delay: 1 + Math.random(), ease: Elastic.easeOut})
            
            stage.appendChild(petal);
        }
    }

    private createPetalPath(p: Position, size: number):string
    {
        let top = size * 4;
        let middle = size * 1.8;
        let width = size;
        let path = `M ${p.x} ${p.y} Q ${p.x - width} ${p.y + middle}  ${p.x} ${p.y + top} Q ${p.x + width} ${p.y + middle} ${p.x} ${p.y} Z`  
        return path;
    }

    public clear()
    {
        this.petals.map((petal: SVGPathElement) => petal.remove())
    }
}