import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable()
export class MediaService {

    constructor(private api: ApiService) {}

    getRoomMedia(imgRef: string) {
        return this.api.get(`images/${imgRef}`);
    }

    getProfileImage(username: string) {
        return this.api.get(`profileimage/${username}`);
    }
}
