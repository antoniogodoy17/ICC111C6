import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private afs: AngularFirestore,
              private afStorage: AngularFireStorage) { }

  createPost(post: any, image: File) {
    return new Promise(async (resolve, reject) => {
      try {
        const postId = this.afs.createId();
        const extension = image.type.split('/')[1];
        const filePath = `posts/${post.username}/${postId}.${extension}`;

        post.postId = postId;
        await this.afs.doc(`posts/${postId}`).set(post);
        await this.uploadPostImage(post, image);
        post.pictureUrl = await this.afStorage.ref(filePath).getDownloadURL().toPromise()
        await this.updatePost(postId, post);

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  uploadPostImage(post: any, image: File) {
    const extension = image.type.split('/')[1];
    const filePath = `posts/${post.username}/${post.postId}.${extension}`;
    const task = this.afStorage.upload(filePath, image);

    return task.snapshotChanges().toPromise();
  }

  getPosts() {
    return this.afs.collection('posts').snapshotChanges().pipe(
      map(docs => docs.map(doc => {
        const post = doc.payload.doc.data() as any;
        const id = doc.payload.doc.id;

        return { id, ...post };
      }))
    );
  }

  getPost(postId: string) {
    return this.afs.doc(`posts/${postId}`).snapshotChanges().pipe(
      map(doc => {
        const post = doc.payload.data() as any;
        const id = doc.payload.id;

        return { id, ...post };
      })
    );

    // return this.afs.collection('posts', ref => ref.where('likes', '>=', 1200).orderBy('likes', 'desc'))
    // .snapshotChanges().pipe(
    //   map(docs => docs.map(doc => {
    //     const post = doc.payload.doc.data() as any;
    //     const id = doc.payload.doc.id;

    //     return { id, ...post };
    //   }))
    // );
  }

  deletePost(postId: string) {
    return this.afs.doc(`posts/${postId}`).delete();
  }

  updatePost(postId: string, updatedPost: any) {
    return this.afs.doc(`posts/${postId}`).update(updatedPost);
  }
}
