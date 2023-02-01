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
import { useSelect } from '@wordpress/data';
import { store as blockStore } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import PhoneNumber from '../../phone-number';

const Block = ( {
	localPickupString,
	showCompanyField = false,
	showApartmentField = false,
	showPhoneField = false,
	requireCompanyField = false,
	requirePhoneField = false,
	deuxPickupString,
}: {
	showCompanyField: boolean;
	showApartmentField: boolean;
	showPhoneField: boolean;
	requireCompanyField: boolean;
	requirePhoneField: boolean;
	localPickupString: string;
	deuxPickupString: string;
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
	const { isEditor, shippingMethodSelection } = useEditorContext();

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

	/*
	  Start MoL Codeblock - Part 1
	*/

	// const getBlocksID = useSelect( ( select ) =>
	// 	select( blockStore ).getBlockOrder()
	// );

	// eslint-disable-next-line no-console
	console.log( 1210 );

	// eslint-disable-next-line no-console
	console.log( localPickupString );
	// eslint-disable-next-line no-console
	console.log( 1212 );
	// eslint-disable-next-line no-console
	console.log( 1214 );

	// eslint-disable-next-line no-console
	console.log( deuxPickupString );
	// eslint-disable-next-line no-console
	console.log( 1216 );

	// eslint-disable-next-line no-console
	// console.log( attributes.deuxPickupString );

	// eslint-disable-next-line no-console
	console.log( 1214 );

	const getBlocks = useSelect( ( select ) =>
		select( blockStore ).getBlocks()
	);

	const { shippingRates } = useStoreCart();

	// So I guess shippingRates is an array.
	// Looking for method_id
	const selectedShippingRates = shippingRates.flatMap(
		( shippingPackage ) => {
			return shippingPackage.shipping_rates
				.filter( ( rate ) => rate.selected )
				.flatMap( ( rate ) => rate.method_id );
		}
	);

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
		// wp.data.select('core/block-editor').getBlocks()
		const showString =
			getBlocks[ 0 ].innerBlocks[ 0 ].innerBlocks[ 4 ].attributes
				.localPickupString;

		setUseShippingAsBilling( false );
		if ( shippingMethodSelection === 'value2' ) {
			return (
				<>
					<p>{ showString }</p>
				</>
			);
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
