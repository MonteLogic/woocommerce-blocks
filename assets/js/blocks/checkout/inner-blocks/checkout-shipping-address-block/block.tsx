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
import { store as blockStore } from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PhoneNumber from '../../phone-number';
// import ShippingMethods from '../checkout-shipping-methods-block/block';

const Block = ( {
	showCompanyField = false,
	showApartmentField = false,
	showPhoneField = false,
	requireCompanyField = false,
	requirePhoneField = false,
	localPickupString = '',
}: {
	showCompanyField: boolean;
	showApartmentField: boolean;
	showPhoneField: boolean;
	requireCompanyField: boolean;
	requirePhoneField: boolean;
	localPickupString: string;
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

	const getBlocks = useSelect( ( select ) =>
		select( blockStore ).getBlocks()
	);

	// wp.data.select('core/block-editor').getBlocks()
	const getBlocksID = useSelect( ( select ) =>
		select( blockStore ).getBlockOrder()
	);

	const checkPickupString =
		getBlocks[ 0 ].innerBlocks[ 0 ].innerBlocks[ 4 ].attributes
			.shippingMethodEditSelection;
	// eslint-disable-next-line no-console
	console.log( getBlocksID );
	// eslint-disable-next-line no-console
	console.log( getBlocksID[ 0 ] );
	// eslint-disable-next-line no-console
	console.log( 1720 );
	// eslint-disable-next-line no-console
	console.log( getBlocks );
	// eslint-disable-next-line no-console
	console.log( 1702 );
	// eslint-disable-next-line no-console
	console.log( getBlocks[ 0 ].innerBlocks[ 0 ].innerBlocks[ 4 ] );
	// eslint-disable-next-line no-console
	console.log( 1682 );
	// eslint-disable-next-line no-console
	console.log(
		getBlocks[ 0 ].innerBlocks[ 0 ].innerBlocks[ 4 ].attributes
			.localPickupString
	);
	// eslint-disable-next-line no-console
	console.log( 1664 );
	// eslint-disable-next-line no-console
	console.log( checkPickupString );
	// eslint-disable-next-line no-console
	console.log( 1646 );

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
				<p>{ localPickupString }</p>
			</>
		);
	}
	/*
	  End MoL Codeblock - Part 1
	*/

	/*
	  Start MoL Codeblock - Part 2
	*/
	if ( isEditor ) {
		if ( checkPickupString === 'value2' ) {
			return <p>You will see nothing here except localPickupString</p>;
		}
	}
	/*
	  End MoL Codeblock - Part 2
	*/
	// return <p>You will see nothing here except localPickupString</p>;
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
