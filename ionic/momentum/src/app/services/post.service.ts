import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { firestore } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  firestore: any;

  constructor(private afs: AngularFirestore,
              private afStorage: AngularFireStorage) { }

  async createPost(post: any, image: File) {
    return new Promise(async (resolve, reject) => {
      try {
        const postId = this.afs.createId();
        const filePath = `posts/${post.uid}/${postId}.jpeg`;

        post.id = postId;
        await this.uploadPostImage(post, image);

        await this.afs.firestore.runTransaction(async transaction => {
          const postRef = this.afs.doc(`posts/${postId}`).ref;
          const userRef = this.afs.doc(`users/${post.uid}`).ref;
          const increment = firestore.FieldValue.increment(1);

          post.pictureUrl = await this.afStorage.ref(filePath).getDownloadURL().toPromise()
          transaction.set(postRef, post);
          transaction.update(userRef, { postsCount: increment });
        });

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  uploadPostImage(post: any, image: File) {
    const filePath = `posts/${post.uid}/${post.id}.jpeg`;
    const task = this.afStorage.upload(filePath, image);

    return task.snapshotChanges().toPromise();
  }

  getPosts() {
    return this.afs.collection('posts').snapshotChanges().pipe(
      map(docs => docs.map(doc => doc.payload.doc.data()))
    );
  }

  getPostsByUser(id: string) {
    return this.afs.collection('posts', ref => ref
      .where('uid', '==', id))
      .snapshotChanges()
      .pipe(
        map(docs => docs.map(doc => doc.payload.doc.data()))
      );
  }

  getPostsByUserAndPage(uid: string, last: any, pageSize: number) {
    const field = 'createdAt';
    const order = 'desc';

    if (last) {
      return this.afs.collection('posts', ref => ref
        .where('uid', '==', uid)
        .orderBy(field, order)
        .startAfter(last[field])
        .limit(pageSize))
        .snapshotChanges()
        .pipe(
          take(1),
          map(docs => docs.map(doc => doc.payload.doc.data()))
        );
    } else {
      return this.afs.collection('posts', ref => ref
        .where('uid', '==', uid)
        .orderBy(field, order)
        .limit(pageSize))
        .snapshotChanges()
        .pipe(
          take(1),
          map(docs => docs.map(doc => doc.payload.doc.data()))
        );
    }
  }

  getPost(postId: string) {
    return this.afs.doc(`posts/${postId}`).snapshotChanges().pipe(
      map(doc => doc.payload.data())
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
