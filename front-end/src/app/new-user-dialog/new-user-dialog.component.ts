import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContractManagerService } from '../contract-manager.service';

@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.css']
})
export class NewUserDialogComponent implements OnInit {

  index = 0;
  driverControl: FormControl = new FormControl();
  constructor(public dialogRef: MatDialogRef<NewUserDialogComponent>,
    public contractManager: ContractManagerService) { }

  ngOnInit(): void {
    this.driverControl.patchValue("");
  }
  increaseIndex() {
    this.index++;
  }
  decreaseIndex() {
    this.index--;
  }
  register(type: string) {
    if (type === 'rider') {
      this.contractManager.addUser(false, "N/A");
      this.dialogRef.close();
    }
    else {
      this.increaseIndex();
    }
  }
  registerDriver() {
    if (this.driverControl.value !== "") {
      this.contractManager.addUser(true, String(this.driverControl.value));
      this.dialogRef.close();
    }
  }

}
