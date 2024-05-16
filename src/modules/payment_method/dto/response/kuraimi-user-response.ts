export class KuraimiUserResponse{

    Code: string
    // SCustID:any
    DescriptionAr:string
    DescriptionEn:string   
    constructor(data: Partial<KuraimiUserResponse>) {
        Object.assign(this, data);
    }
}
