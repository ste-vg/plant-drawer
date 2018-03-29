import './app.scss';
import { Pkg } from "../package";
import { Branch, Out } from "./branch/branch";
import { BranchSettings } from "./branch/Settings";
import { BranchState } from './branch/State';
import { Position } from './Position';
import { Thorn } from "./thorn/thorn";

import { Observable } from "rxjs";

import { TweenMax } from "gsap";
import { Flower } from './flower/flower';
import { Leaf } from './leaf/leaf';
import { FlowerColors } from './flower/FlowerColors';

const html = require('./app.html');

export class App
{
	private container:HTMLElement;
	private downloadButton:HTMLElement;
	private svg:HTMLElement;
	private branches:Branch[] = [];
	private thorns:Thorn[] = [];
	private flowers:Flower[] = [];
	private leaves:Leaf[] = [];

	private width: number = 600;
	private height: number = 600;

	private lastMousePosition:Position;
	private direction:Position;

	private branchGroup:HTMLElement;
	private thornGroup:HTMLElement;
	private leafGroup:HTMLElement;
	private flowerGroup:HTMLElement;

	private grid:number = 40;

	private flowerColors:FlowerColors;

	// codpen path
	//private path:string = 'M64.6-37.7H16.2v75.4h48.5 M247.7-37.7h-48.5v75.4h48.5 M231.5,0h-32.3 M48.5,0H16.2 M290.8,37.7v-75.4 L350,37.7v-75.4 M-247.7,19.9l59.2,39.3l59.2-39.3v-39.8l-59.2-39.3l-59.2,39.3V19.9z M-129.2,19.9l-59.2-39.8l-59.2,39.8 M-247.7-19.9l59.2,39.3l59.2-39.3 M-188.5-59.2v39.3 M-188.5,19.9v39.3 M107.7,5.4H140c11.8,0,21.5-9.7,21.5-21.5 s-9.7-21.5-21.5-21.5h-32.3v75.4 M-285.4-26.9c-7-7-16.2-10.8-26.9-10.8C-333.8-37.7-350-21.5-350,0s16.2,37.7,37.7,37.7 c10.8,0,19.9-4.3,26.9-10.8 M-21.5,0c0,21.5-16.2,37.7-37.7,37.7h-26.9v-75.4h26.9C-37.7-37.7-21.5-21.5-21.5,0z';
	
	// box path
	//private path:string = 'M -250 -250, L 250 -250, 250 250, -250 250 Z';

	// random path
	private path:string;

	constructor(container:HTMLElement)
	{
		console.log(Pkg().version);

		this.container = container;
		this.container.innerHTML = html;
		this.svg = document.getElementById('stage');

		this.branchGroup = document.getElementById('branchGroup');
		this.thornGroup = document.getElementById('thornGroup');
		this.leafGroup = document.getElementById('leafGroup');
		this.flowerGroup = document.getElementById('flowerGroup');

		this.onResize();

		this.tick();
		
		Observable.fromEvent(this.container, 'click')
			.map((mouseEvent:MouseEvent) => 
			{
				mouseEvent.preventDefault();
				return {
					x: mouseEvent.clientX, 
					y: mouseEvent.clientY
				};
			})
			.subscribe((position:Position) => 
			{
				this.clearOld();
				this.startBranch(16, position, true, this.path);
			});

		this.startBranch(16, {x: this.width / 2, y: this.height / 2}, true, this.path);

		Observable.fromEvent(window, "resize").subscribe(() => this.onResize())
	}

	private clearOld()
	{
		this.branches.map((branch:Branch) => 
		{
			branch.clear();
		});
		this.thorns.map((thorn:Thorn) => thorn.clear());
		this.flowers.map((flower:Flower) => flower.clear());
		this.leaves.map((leaf:Leaf) => leaf.clear());

		TweenMax.killAll();

		this.branches = [];
		this.thorns = [];
		this.flowers = [];
		this.leaves = [];
	}

	private startBranch(sections:number, position:Position, setColors:boolean = false, setPath:string = null)
	{
		if(setColors)
		{
			this.flowerColors = {
				outer: this.getColor(),
				inner: this.getColor()
			}
		}

		let dx = Math.random();
		if(dx > 0.5) dx = dx > 0.75 ? 1 : -1;
		else dx = 0;
		let dy= 0;
		if(dx == 0) dx = Math.random() > 0.5 ? 1 : -1;

		let settings:BranchSettings = {
			x: position.x,
			y: position.y,
			directionX: dx,
			directionY: dy,
			sections: sections
		}
		let newBranch = new Branch(this.branchGroup, settings, this.grid/2 + Math.random() * this.grid/2, this.branches.length > 1 ? this.branches[this.branches.length - 2]: null, setPath);
		
		newBranch.branchOut.debounceTime(200).subscribe((out:Out) => this.startBranch(out.sections, out.position))
		newBranch.thornOut.debounceTime(100).subscribe((out:Out) => this.thorns.push(new Thorn(this.thornGroup, out.position, out.width)))
		newBranch.flowerOut.debounceTime(300).subscribe((out:Out) => this.flowers.push(new Flower(this.flowerGroup, out.position, out.width, this.flowerColors)))
		newBranch.leafOut.debounceTime(50).subscribe((out:Out) => this.leaves.push(new Leaf(this.leafGroup, out.position, out.width)))
		this.branches.push(newBranch);
	}

	private onResize()
	{
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;

		this.svg.setAttribute('width', String(this.width));
		this.svg.setAttribute('height', String(this.height));

		if(this.path)
		{
			TweenMax.set(this.branchGroup, {x: this.width / 2, y: this.height / 2});
			TweenMax.set(this.thornGroup, {x: this.width / 2, y: this.height / 2});
			TweenMax.set(this.leafGroup, {x: this.width / 2, y: this.height / 2});
			TweenMax.set(this.flowerGroup, {x: this.width / 2, y: this.height / 2});
		}
	}

	private tick()
	{
		let step = this.branches.length - 1;

		while(step >= 0)
		{
			if(this.branches[step].state != BranchState.ended)
			{
				this.branches[step].update();
				
			}
			else
			{
				//this.branches[step] = null;
				//this.branches.splice(step, 1);
			}

			--step;	
		}

		requestAnimationFrame(() => this.tick());
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