import './app.scss';
import { Pkg } from "../package";
import { Branch, Out } from "./branch/branch";
import { BranchSettings } from "./branch/Settings";
import { BranchState } from './branch/State';
import { Position } from './Position';
import { Input } from './input';
import { Thorn } from "./thorn/thorn";

import { Observable } from "rxjs";

import { TweenLite, TweenMax } from "gsap";

const html = require('./app.html');

export class App
{
	private container:HTMLElement;
	private svg:HTMLElement;
	private branches:Branch[] = [];
	private thorns:Thorn[] = [];

	private width: number = 600;
	private height: number = 600;

	private lastMousePosition:Position;
	private direction:Position;

	private grid:number = 40;

	constructor(container:HTMLElement)
	{
		console.log(Pkg().version);

		this.container = container;
		this.container.innerHTML = html;
		this.svg = document.getElementById('stage');
		this.onResize();

		this.tick();

		let input = new Input(this.container);
		
		//input.starts.subscribe((position:Position) => this.lastMousePosition = position)
		input.ends.subscribe((position:Position) => 
		{
			this.clearOld();
			this.startABranch(16, position);
		})

		//if(location.pathname.match(/fullcpgrid/i)) 

		Observable.fromEvent(window, "resize").subscribe(() => this.onResize())
	}

	clearOld()
	{
		TweenMax.killAll();

		this.branches.map((branch:Branch) => branch.clear());
		this.thorns.map((thorn:Thorn) => thorn.clear());

		this.branches = [];
		this.thorns = [];
	}

	startABranch(sections:number, position:Position)
	{
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
		let newBranch = new Branch(this.svg, settings, this.grid/2 + Math.random() * this.grid/2, this.branches.length ? this.branches[Math.floor(Math.random() * (this.branches.length - 1))]: null);
		newBranch.branchOut.subscribe((settings:BranchSettings) => {
			this.startABranch(settings.sections, {x: settings.x, y: settings.y})
		})
		newBranch.thornOut.subscribe((out:Out) => {
			this.thorns.push(new Thorn(this.svg, out.position, out.width))
		})
		this.branches.push(newBranch);
	}

	onResize()
	{
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;

		this.svg.setAttribute('width', String(this.width));
		this.svg.setAttribute('height', String(this.height));
	}

	tick()
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
}