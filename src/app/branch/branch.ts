import { BranchSettings } from "./Settings";
import { BranchState } from "./State";
import { TweenLite, Power1 } from "gsap";

interface BranchSet
{
    path: SVGPathElement;
    settings: BranchSettings;
}

export class Branch
{
    private grid:number;
    private stage:HTMLElement;
    private branch:SVGPathElement;
    private branches: BranchSet[] = [];
    private settings:BranchSettings;
    public state:BranchState = BranchState.ready;

    constructor(stage:HTMLElement, settings:BranchSettings, grid:number)
    {
        this.grid = grid;
        this.stage = stage;
   
        settings.width = 0;
        settings.opacity = 1;

        this.state = BranchState.animating;
        let path = this.createLine(settings);
        let branchCount:number = 3;
        for(let i = 0; i < branchCount; i++)
        {
            this.createSqwig(i, branchCount, path, JSON.parse(JSON.stringify(settings)) as BranchSettings, i == branchCount - 1)
        }
    }

    createSqwig(index:number, total:number, path:string, settings:BranchSettings, forceWhite:boolean)
    {
        let branch = document.createElementNS("http://www.w3.org/2000/svg", 'path')
            branch.setAttribute('d', path)
            branch.style.fill = 'none';
            branch.style.stroke = forceWhite ? '#303030' : this.getColor();
            branch.style.strokeLinecap = "round"
        
        settings.length =  branch.getTotalLength();
        settings.chunkLength = settings.length / 6; //(settings.sections * 2) + (Math.random() * 40);
        settings.progress = settings.chunkLength;

        branch.style.strokeDasharray= `${settings.chunkLength}, ${settings.length + settings.chunkLength}`
        branch.style.strokeDashoffset = `${settings.progress}`

        this.stage.appendChild(branch);

        this.branches.unshift({path: branch, settings: settings});

        TweenLite.to(settings, settings.sections * 0.1, {
            progress: - settings.length,
            width: settings.sections * 0.9,
            ease: Power1.easeOut,
            delay: index * (settings.sections * 0.01),
            onComplete: () => 
            {
                if(index = total - 1) this.state = BranchState.ended;
                branch.remove();
            }
        })
    }

    public update()
    {
        this.branches.map((set: BranchSet) => 
        {
            set.path.style.strokeDashoffset = `${set.settings.progress}`;
            set.path.style.strokeWidth = `${set.settings.width}px`;
            set.path.style.opacity = `${set.settings.opacity}`;
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
            '' + y,
            "Q"
        ]

        let steps = settings.sections;
        let step = 0;
        let getNewDirection = (direction: string, goAnywhere:boolean) => 
        {
            if(!goAnywhere && settings['direction' + direction.toUpperCase()] != 0) return settings['direction' + direction.toUpperCase()];
            return Math.random() < 0.5 ? -1 : 1;
        }

        while(step < steps * 2)
        {
            step++;
            x += (dx * (step/ 30)) * this.grid;
            y += (dy * (step/ 30)) * this.grid;
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

    private getColor():string
    {
        let offset = Math.round(Math.random() * 100)
        var r = Math.sin(0.3 * offset) * 100 + 155;
        var g = Math.sin(0.3 * offset + 2) * 100 + 155;
        var b = Math.sin(0.3 * offset + 4) * 100 + 155;
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    private componentToHex(c:number) 
    {
        var hex = Math.round(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
}