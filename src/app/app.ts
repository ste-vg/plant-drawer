import './app.scss';
import { Pkg } from "../package";
import { Branch, Out } from "./branch/branch";
import { BranchSettings } from "./branch/Settings";
import { BranchState } from './branch/State';
import { Position } from './Position';
import { Input } from './input';
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

	private grid:number = 40;

	private flowerColors:FlowerColors;

	constructor(container:HTMLElement, downloadButton:HTMLElement)
	{
		console.log(Pkg().version);

		this.container = container;
		this.downloadButton = downloadButton;
		this.container.innerHTML = html;
		this.svg = document.getElementById('stage');
		this.onResize();

		this.tick();

		
		Observable.fromEvent(this.downloadButton, 'click')
			.map((mouseEvent:MouseEvent) => {mouseEvent.preventDefault()})
			.subscribe(() => this.download());
		
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
				this.startBranch(16, position, true);
			});

		this.startBranch(16, {x: this.width / 2, y: this.height / 2}, true);

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

	private startBranch(sections:number, position:Position, setColors:boolean = false)
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
		let newBranch = new Branch(this.svg, settings, this.grid/2 + Math.random() * this.grid/2, this.branches.length > 1 ? this.branches[this.branches.length - 2]: null);
		
		newBranch.branchOut.debounceTime(200).subscribe((out:Out) => this.startBranch(out.sections, out.position))
		newBranch.thornOut.debounceTime(100).subscribe((out:Out) => this.thorns.push(new Thorn(this.svg, out.position, out.width)))
		newBranch.flowerOut.debounceTime(300).subscribe((out:Out) => this.flowers.push(new Flower(this.svg, out.position, out.width, this.flowerColors)))
		newBranch.leafOut.debounceTime(50).subscribe((out:Out) => this.leaves.push(new Leaf(this.svg, out.position, out.width)))
		this.branches.push(newBranch);
	}

	private onResize()
	{
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;

		this.svg.setAttribute('width', String(this.width));
		this.svg.setAttribute('height', String(this.height));
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

	private download()
	{
		// var serializer = new XMLSerializer();
		// serializer.serializeToString(this.svg);

		var a = document.createElement('a'), xml, ev;
		a.download = 'my-amazing-plant(by ste.vg).svg'; // file name
		xml = (new XMLSerializer()).serializeToString(this.svg); // convert node to xml string
		a.href = 'data:application/octet-stream;base64,' + btoa(xml); // create data uri
		// <a> constructed, simulate mouse click on it
		ev = document.createEvent("MouseEvents");
		ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(ev);
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