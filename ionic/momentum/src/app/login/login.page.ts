import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  loadingIndicator;
  loading = false;

  constructor(private authService: AuthService,
              private navCtrl: NavController,
              private router: Router,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.initForm();

    const navigationId = this.router.getCurrentNavigation().id;

    if (navigationId === 1) {
      this.presentLoading('Loading...');
      this.authService.user$.pipe(take(1)).subscribe((user) => {
        setTimeout(() => {
          this.dismissLoading();
        }, 200);
        if (user) {
          this.navCtrl.navigateRoot(['tabs']);
        }
      });
    }
  }

  initForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    });
  }

  async onSubmit(): Promise<void> {
    await this.presentLoading('Authenticating you...');

    if (this.loginForm.valid) {
      const email = this.loginForm.controls.email.value;
      const password = this.loginForm.controls.password.value;

      this.authService.login(email, password).then(() => {
        this.dismissLoading();
        this.navCtrl.navigateRoot(['tabs']);
      }).catch((error) => {
        this.dismissLoading();
        this.presentAlert('Something went wrong', error.message);
      });

    } else {
      this.dismissLoading();
      this.presentAlert('Something went wrong', 'Please type in your email and password.');
    }
  }

  goToSignup(): void {
    this.navCtrl.navigateForward(['signup']);
  }

  async presentLoading(body: string) {
    this.loadingIndicator = await this.loadingCtrl.create({
      message: body
    });
    this.loading = true;
    await this.loadingIndicator.present();
  }

  async dismissLoading() {
    this.loading = false;
    await this.loadingIndicator.dismiss();
  }

  async presentAlert(title: string, body: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: body,
      buttons: ['Got It']
    });

    await alert.present();
  }
}
