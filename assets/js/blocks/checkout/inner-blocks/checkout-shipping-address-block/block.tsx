/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useMemo, useEffect, Fragment, useState } from '@wordpress/element';
import { AddressForm } from '@woocommerce/base-components/cart-checkout';
import {
	useCheckoutAddress,
	useStoreEvents,
	useEditorContext,
	useStoreCart
} from '@woocommerce/base-context';
import { CheckboxControl } from '@woocommerce/blocks-checkout';
import Noninteractive from '@woocommerce/base-components/noninteractive';
import type {
	BillingAddress,
	ShippingAddress,
	AddressField,
	AddressFields,
} from '@woocommerce/settings';

/**
 * Internal dependencies
 */
import PhoneNumber from '../../phone-number';

const Block = ( {
	showCompanyField = false,
	showApartmentField = false,
	showPhoneField = false,
	requireCompanyField = false,
	requirePhoneField = false,
}: {
	showCompanyField: boolean;
	showApartmentField: boolean;
	showPhoneField: boolean;
	requireCompanyField: boolean;
	requirePhoneField: boolean;
} ): JSX.Element => {
	const {
		defaultAddressFields,
		setShippingAddress,
		setBillingAddress,
		shippingAddress,
		setShippingPhone,
		useShippingAsBilling,
		setUseShippingAsBilling,
	} = useCheckoutAddress();
	const { dispatchCheckoutEvent } = useStoreEvents();
	const { isEditor } = useEditorContext();

	// This is used to track whether the "Use shipping as billing" checkbox was checked on first load and if we synced
	// the shipping address to the billing address if it was. This is not used on further toggles of the checkbox.
	const [ addressesSynced, setAddressesSynced ] = useState( false );

	// Clears data if fields are hidden.
	useEffect( () => {
		if ( ! showPhoneField ) {
			setShippingPhone( '' );
		}
	}, [ showPhoneField, setShippingPhone ] );

	// Run this on first render to ensure addresses sync if needed, there is no need to re-run this when toggling the
	// checkbox.
	useEffect( () => {
		if ( addressesSynced ) {
			return;
		}
		if ( useShippingAsBilling ) {
			setBillingAddress( shippingAddress );
		}
		setAddressesSynced( true );
	}, [ setBillingAddress, shippingAddress, useShippingAsBilling ] );

	const addressFieldsConfig = useMemo( () => {
		return {
			company: {
				hidden: ! showCompanyField,
				required: requireCompanyField,
			},
			address_2: {
				hidden: ! showApartmentField,
			},
		};
	}, [
		showCompanyField,
		requireCompanyField,
		showApartmentField,
	] ) as Record< keyof AddressFields, Partial< AddressField > >;

	const AddressFormWrapperComponent = isEditor ? Noninteractive : Fragment;
	console.log(useShippingAsBilling);

	const {
		shippingRates,
	} = useStoreCart();
	console.log(shippingRates);
	
	
	
	// So I guess shippingRates is an array. 
	
	// Looking for method_id 
	const selectedShippingRates = shippingRates.flatMap(
		( shippingPackage ) => {
			return shippingPackage.shipping_rates
				.filter( ( rate ) => rate.selected )
				.flatMap( ( rate ) => rate.method_id );
		}
	);
	// Looking for method_id 



	console.log(selectedShippingRates[0]);

    if(selectedShippingRates[0] == "local_pickup"){
        setUseShippingAsBilling( false );
	      return (
		        <>
		           <p>You have selected Local Pickup your order will be at the Matlack HQ</p>
				   <PhoneNumber
						id="shipping-phone"
						isRequired={ requirePhoneField }
						value={ shippingAddress.phone }
						onChange={ ( value ) => {
							console.log("changed");
							console.log(shippingAddress.phone);
							setShippingPhone( value );
							dispatchCheckoutEvent( 'set-phone-number', {
								step: 'shipping',
							} );
						} }
					/>
		        </>
		)
		// Local pickup has been selected. 
		// return null;
	}



	return (
		<>
			<AddressFormWrapperComponent>
				<AddressForm
					id="shipping"
					type="shipping"
					onChange={ ( values: Partial< ShippingAddress > ) => {
						setShippingAddress( values );
						if ( useShippingAsBilling ) {
							setBillingAddress( values );
						}
						dispatchCheckoutEvent( 'set-shipping-address' );
					} }
					values={ shippingAddress }
					fields={
						Object.keys(
							defaultAddressFields
						) as ( keyof AddressFields )[]
					}
					fieldConfig={ addressFieldsConfig }
				/>
				{ showPhoneField && (
					<PhoneNumber
						id="shipping-phone"
						isRequired={ requirePhoneField }
						value={ shippingAddress.phone }
						onChange={ ( value ) => {
							setShippingPhone( value );
							dispatchCheckoutEvent( 'set-phone-number', {
								step: 'shipping',
							} );
						} }
					/>
				) }
			</AddressFormWrapperComponent>
			<CheckboxControl
				className="wc-block-checkout__use-address-for-billing"
				label={ __(
					'Use same address for billing',
					'woo-gutenberg-products-block'
				) }
				// I may have to add another qualifer here: such as LocalPickup selected or similar var for showing Pickup. 
				// or I could have something like:
				// isPickupSelected = {pickupIsSelectedVar}
				checked={ useShippingAsBilling }
				onChange={ ( checked: boolean ) => {
					setUseShippingAsBilling( checked );
					if ( checked ) {
						setBillingAddress( shippingAddress as BillingAddress );
					}
				} }
			/>
		</>
	);
};

export default Block;
