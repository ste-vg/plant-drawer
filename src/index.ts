import './styles.scss';
import { App } from "./app/app";

let container = document.getElementById('app');
let downlaodButton = document.getElementById('download-button');
let app = new App(container, downlaodButton);