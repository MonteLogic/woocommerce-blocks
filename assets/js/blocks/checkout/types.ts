export type InnerBlockTemplate = [
	string,
	Record< string, unknown >,
	InnerBlockTemplate[] | undefined
];

export interface Attributes
	extends Record< string, boolean | number | string > {
	hasDarkControls: boolean;
	localPickupString: string;
	shippingMethodEditSelection: string;
	showCompanyField: boolean;
	showApartmentField: boolean;
	showPhoneField: boolean;
	requireCompanyField: boolean;
	requirePhoneField: boolean;
	// Deprecated.
	showOrderNotes: boolean;
	showPolicyLinks: boolean;
	showReturnToCart: boolean;
	showRateAfterTaxName: boolean;
	cartPageId: number;
}
