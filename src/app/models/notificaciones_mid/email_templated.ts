export class EmailTemplated {
        Source!: string;
        Template!: string;
        Destinations!: Destination[];
        DefaultTemplateData!: {};
}

export class Destination {
        Destination!: {
                ToAddresses: string[];
        };
        ReplacementTemplateData!: {};
}