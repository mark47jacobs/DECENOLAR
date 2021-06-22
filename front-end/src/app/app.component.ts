import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { ContractManagerService } from './contract-manager.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NewUserDialogComponent } from './new-user-dialog/new-user-dialog.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'front-end';
  constructor(public contractManager: ContractManagerService,
    private dialog: MatDialog,
    private breakPointObserver: BreakpointObserver) { }

  ngOnInit() {
    this.contractManager.loadWeb3();
    this.contractManager.loadBlockchainData();
    setTimeout(() => {
      this.contractManager.existing_user.subscribe((value) => {
        console.log('existing_user value changed to', value);
        if (value) {
          this.dialog.closeAll();
        }
        else {
          this.openNewUserDialog();
        }
      });
    }, 1500);
  }

  openNewUserDialog() {
    this.dialog.closeAll();
    if (!this.contractManager.userData) {
      console.log('openNewUseDialog called');
      const dialogConfig = new MatDialogConfig();
      dialogConfig.hasBackdrop = true;
      this.breakPointObserver.observe([
        '(min-width: 1024px)'
      ]).subscribe(
        result => {
          if (result.matches) {
            console.log('screen is greater than  1024px');
            dialogConfig.width = '40vw';
            dialogConfig.minHeight = '60vh';
          } else {
            console.log('screen is less than  1024px');
            dialogConfig.width = '90vw';
            dialogConfig.minHeight = '90vh';
          }
        }
      );
      // dialogConfig.id = "newUser";
      dialogConfig.disableClose = true;
      const dialogRef = this.dialog.open(NewUserDialogComponent, dialogConfig);
      return dialogRef.afterClosed();
    }
    return null;
  }

}
