/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	useMemo,
	useEffect,
	Fragment,
	useState,
	useContext,
} from '@wordpress/element';
import { AddressForm } from '@woocommerce/base-components/cart-checkout';
import {
	useCheckoutAddress,
	useStoreEvents,
	useEditorContext,
	noticeContexts,
	useStoreCart,
} from '@woocommerce/base-context';
import {
	CheckboxControl,
	StoreNoticesContainer,
} from '@woocommerce/blocks-checkout';
import Noninteractive from '@woocommerce/base-components/noninteractive';
import type {
	BillingAddress,
	ShippingAddress,
	AddressField,
	AddressFields,
} from '@woocommerce/settings';

// import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import PhoneNumber from '../../phone-number';
import { ValueContext } from '../checkout-shipping-methods-block/block';
// import ShippingMethods from '../checkout-shipping-methods-block/block';

const Block = ( {
	isLocalPickupSelected = false,
	showCompanyField = false,
	showApartmentField = false,
	showPhoneField = false,
	requireCompanyField = false,
	requirePhoneField = false,
	localPickupInfo = '',
}: {
	isLocalPickupSelected: boolean;
	showCompanyField: boolean;
	showApartmentField: boolean;
	showPhoneField: boolean;
	requireCompanyField: boolean;
	requirePhoneField: boolean;
	localPickupInfo: string;
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

	// const value = useContext( ValueContext );
	// Store selected rate ID in local state so shipping rates changes are shown in the UI instantly.

	const value = useContext( ValueContext );

	// Okay now that I can read that value I can be like, if ValueContext is === true than don't render the shipping address section.
	// only show the billing section.

	// eslint-disable-next-line no-console
	console.log( 'value = ' );
	// eslint-disable-next-line no-console
	console.log( value );
	// eslint-disable-next-line no-console
	console.log( 1702 );
	// eslint-disable-next-line no-console
	console.log( isLocalPickupSelected );
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
	}, [
		addressesSynced,
		setBillingAddress,
		shippingAddress,
		useShippingAsBilling,
	] );

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
	if ( isEditor ) {
		// Working on changing
		// eslint-disable-next-line no-console
		console.log( 'On the editor' );
		// eslint-disable-next-line no-console
		console.log(
			'I would like to have state actions here. Which would then be an attribute(?), additional state.'
		);
		// I need to access the shipping-methods state here.
	}

	/*
	  Start MoL Codeblock - Part 1
	*/

	const { shippingRates } = useStoreCart();

	// eslint-disable-next-line no-console
	console.log( shippingRates );
	// So I guess shippingRates is an array.
	// Looking for method_id
	const selectedShippingRates = shippingRates.flatMap(
		( shippingPackage ) => {
			return shippingPackage.shipping_rates
				.filter( ( rate ) => rate.selected )
				.flatMap( ( rate ) => rate.method_id );
		}
	);

	// eslint-disable-next-line no-console
	console.log( selectedShippingRates[ 0 ] );
	if ( selectedShippingRates[ 0 ] === 'local_pickup' ) {
		setUseShippingAsBilling( false );
		return (
			<>
				<p>{ localPickupInfo }</p>
			</>
		);
	}
	/*
	  End MoL Codeblock - Part 1
	*/

	if ( value === true ) {
		return <p> Local pickup is selected </p>;
	}

	/*
	  Start MoL Codeblock - Part 2
	*/

	/*
	  End MoL Codeblock - Part 2
	*/
	return (
		<>
			<AddressFormWrapperComponent>
				<StoreNoticesContainer
					context={ noticeContexts.SHIPPING_ADDRESS }
				/>
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
