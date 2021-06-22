import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { ContractManagerService } from '../contract-manager.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {



  loading: boolean = true;
  constructor(
    public contractManager: ContractManagerService,
    public router: Router) {

  }

  ngOnInit() {
    this.loading = true;
    this.initialize();
    this.setupHeaderBg();
  }

  ngAfterViewInit() {
    console.log('View Initialised!');
  }

  initialize() {
    const doc = document.documentElement;
    doc.classList.remove('no-js');
    doc.classList.add('js');
  }
  setupHeaderBg() {
    const doc = document.documentElement;
    const win = window;
    const headerBg: HTMLElement = document.querySelector('.site-header-large-bg span') as HTMLElement;

    function setHeaderBgHeight() {
      var bodyHeight = doc.getElementsByTagName('body')[0].clientHeight;
      if (headerBg)
        headerBg.style.height = `${bodyHeight}px`;
    }

    setHeaderBgHeight();
    win.addEventListener('load', setHeaderBgHeight);
    win.addEventListener('resize', setHeaderBgHeight);
  }
  redirect() {
    if (this.contractManager.userData.isDriver) {
      this.router.navigateByUrl('/get-ride');
    }
    else {
      this.router.navigateByUrl('ride');
    }
  }
}
