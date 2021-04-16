import { Component, OnInit } from '@angular/core';
import { ContractManagerService } from '../contract-manager.service';

@Component({
  selector: 'app-illustration',
  templateUrl: './illustration.component.html',
  styleUrls: ['./illustration.component.css']
})
export class IllustrationComponent implements OnInit {

  constructor(public contractManager: ContractManagerService) { }

  ngOnInit(): void {
  }

}
