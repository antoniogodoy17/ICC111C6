import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  signupForm: FormGroup;
  loadingIndicator: any;
  loading = false;

  constructor(private userService: UserService,
              private authService: AuthService,
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
    this.signupForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      name: new FormControl(null, [Validators.required]),
      username: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });
  }

  async onSubmit(): Promise<void> {
    await this.presentLoading('Authenticating you...');

    if (this.signupForm.valid) {
      const email = this.signupForm.controls.email.value;
      const password = this.signupForm.controls.password.value;
      const username = this.signupForm.controls.username.value.toLowerCase();
      const name = this.signupForm.controls.name.value;

      try {
        await this.userService.usernameExists(username);
        const credentials = await this.authService.signup(email, password);

        const user = {
          id: credentials.user.uid,
          username,
          email,
          name,
        };

        await this.userService.createUser(user);
        await this.userService.createUsername(user);
        await this.authService.logout();
        this.dismissLoading();
        this.presentAlertConfirm('Welcome aboard!', 'Your account has been created successfully.');
      } catch (error) {
        this.dismissLoading();
        this.presentAlert('Something went wrong', error.message);
      }

    } else {
      this.dismissLoading();
      this.presentAlert('Something went wrong', 'Please fill in all the fields correctly.');
    }
  }

  goToLogin(): void {
    this.navCtrl.navigateBack(['']);
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

  async presentAlertConfirm(title: string, body: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: body,
      buttons: [
        {
          text: 'Got It',
          handler: () => {
            this.navCtrl.navigateRoot(['']);
          }
        }
      ]
    });

    await alert.present();
  }
}
