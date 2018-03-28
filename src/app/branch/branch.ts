import { BranchSettings } from "./Settings";
import { BranchState } from "./State";
import { TweenMax, Power1 } from "gsap";
import { Subject } from "rxjs";
import { Position } from "../Position";

interface BranchSet
{
    path: SVGPathElement;
    settings: BranchSettings;
}

export interface Out
{
    position: Position;
    width?: number;
    sections?: number;
}

export class Branch
{
    private grid:number;
    private stage:HTMLElement;
    private branch:SVGPathElement;
    public branches: BranchSet[] = [];
    private settings:BranchSettings;
    public state:BranchState = BranchState.ready;
    private placeBehind:Branch;
    
    public branchOut:Subject<Out> = new Subject();
    public thornOut:Subject<Out> = new Subject();
    public flowerOut:Subject<Out> = new Subject();
    public leafOut:Subject<Out> = new Subject();

    constructor(stage:HTMLElement, settings:BranchSettings, grid:number, placeBehind:Branch = null)
    {
        this.grid = 50;//grid;
        this.stage = stage;
        this.placeBehind = placeBehind;
   
        settings.width = 2;
        settings.opacity = 1;

        this.state = BranchState.animating;
        let path = this.createLine(settings);
        let branchCount:number = 2;
        for(let i = 0; i < branchCount; i++)
        {
            this.createSqwig(i, branchCount, path, JSON.parse(JSON.stringify(settings)) as BranchSettings)
        }
    }

    createSqwig(index:number, total:number, path:string, settings:BranchSettings)
    {
        let branch = document.createElementNS("http://www.w3.org/2000/svg", 'path')
            branch.setAttribute('d', path)
            branch.style.fill = 'none';
            branch.style.stroke = this.getColor(index);
            branch.style.strokeLinecap = "round";
        
        settings.length = branch.getTotalLength();
        settings.progress = settings.length;

        branch.style.strokeDasharray= `${settings.length}, ${settings.length}`;
        branch.style.strokeDashoffset = `${settings.length}`;

        this.branches.push({path: branch, settings: settings});
        if(!this.placeBehind) this.stage.appendChild(branch);
        else this.stage.insertBefore(branch, this.placeBehind.branches[0].path)

        let widthTarget = settings.sections * 0.6;

        TweenMax.set(branch, {x: -index * 2, y: -index * 2})

        TweenMax.to(settings, settings.sections * 0.4, {
            progress: 0,
            width: widthTarget,
            ease: Power1.easeOut,
            delay: index * (settings.sections * 0.001),
            onUpdate: () => 
            {
                if(index == 0 && settings.sections > 4)
                {
                    let choice = Math.random();
                    let length = settings.length - settings.progress;
                    let pos = branch.getPointAtLength(length);

                    let sec = Math.ceil((settings.progress / settings.length) * settings.sections) - 2;
                        if( sec < 4) sec = 4;

                    let out:Out = {
                        position: {x: pos.x, y: pos.y},
                        width: widthTarget,
                        sections: sec
                    }

                    if(choice < 0.02) this.branchOut.next(out)
                    else if(choice < 0.1) this.thornOut.next(out)
                    else if(choice < 0.2) this.flowerOut.next(out)
                    else if(choice < 0.4) this.leafOut.next(out)
                }
            },
            onComplete: () => 
            {
                if(index = total - 1) this.state = BranchState.ended;
                //branch.remove();
            }
        })
    }

    public update()
    {
        this.branches.map((set: BranchSet) => 
        {
            set.path.style.strokeDashoffset = `${set.settings.progress}`;
            set.path.style.strokeWidth = `${set.settings.width}px`;
            //set.path.style.opacity = `${set.settings.opacity}`;
        })
        
    }

    private createLine(settings:BranchSettings):string
    {
        let x = settings.x;
        let y = settings.y;
        let dx = settings.directionX;
        let dy = settings.directionY;
        let path:string[] = [
            'M',
            '' + x,
            '' + y
            
        ]

        let steps = settings.sections;
        let step = 0;
        let getNewDirection = (direction: string, goAnywhere:boolean) => 
        {
            if(!goAnywhere && settings['direction' + direction.toUpperCase()] != 0) return settings['direction' + direction.toUpperCase()];
            return Math.random() < 0.5 ? -1 : 1;
        }

        if(steps * 2 > step) path.push("Q")

        while(step < steps * 2)
        {
            step++;
            let stepUp = this.stepUp(step);
            x += (dx * stepUp) * this.grid;
            y += (dy * stepUp) * this.grid;
            if(step != 1) path.push(',');
            path.push('' + x);
            path.push('' + y);
            
            if(step % 2 != 0)
            {
                dx = dx == 0 ? getNewDirection('x', step > 8) : 0;
                dy = dy == 0 ? getNewDirection('y', step > 8) : 0;
            }
        }

        return path.join(' ');
    }

    private stepUp(step:number):number
    {
        let r = Math.random() * 10;
        return step / (10 + r)
    }

    public clear()
    {
        this.branchOut.complete();
        this.thornOut.complete();
        this.leafOut.complete();
        this.flowerOut.complete();
        this.branches.map((set: BranchSet) => set.path.remove())
    }

    private getColor(index:number):string
    {
        let base = ['#646F4B']
        let greens = ['#6FCAB1'];//, '#5DC4A8', '#4BBD9E', '#3AB795', '#A7CCBA', '#91C0A9', '#86BAA1']

        //return index == 0 ? '#646F4B' : '#77B28C';
        let chooseFrom = index == 0 ? base : greens;
        // let offset = Math.round(Math.random() * 100)
        // var r = Math.sin(0.3 * offset) * 10 + 100;
        // var g = Math.sin(0.3 * offset + 2) * 100 + 155;
        // var b = Math.sin(0.3 * offset + 4) * 10 + 100;
        //return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        return chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
    }

    // private componentToHex(c:number) 
    // {
    //     var hex = Math.round(c).toString(16);
    //     return hex.length == 1 ? "0" + hex : hex;
    // }
}