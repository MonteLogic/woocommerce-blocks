/**
 * External dependencies
 */
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	PlainText,
} from '@wordpress/block-editor';
import { PanelBody, ExternalLink } from '@wordpress/components';
import { ADMIN_URL, getSetting } from '@woocommerce/settings';
import ExternalLinkCard from '@woocommerce/editor-components/external-link-card';
import { innerBlockAreas } from '@woocommerce/blocks-checkout';
import RadioControl from '@woocommerce/base-components/radio-control';
import { useState } from '@wordpress/element';
import type { CartShippingPackageShippingRate } from '@woocommerce/types';
import { useEditorContext } from '@woocommerce/base-context';

/**
 * Internal dependencies
 */
import {
	FormStepBlock,
	AdditionalFields,
	AdditionalFieldsContent,
} from '../../form-step';

type shippingAdminLink = {
	id: number;
	title: string;
	description: string;
};

export const Edit = ( {
	selectedRate,
	attributes,
	setAttributes,
}: {
	attributes: {
		title: string;
		description: string;
		showStepNumber: boolean;
		className: string;
		localPickupString: string;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
	selectedRate: CartShippingPackageShippingRate | undefined;
} ): JSX.Element => {
	const globalShippingMethods = getSetting(
		'globalShippingMethods'
	) as shippingAdminLink[];
	const activeShippingZones = getSetting(
		'activeShippingZones'
	) as shippingAdminLink[];

	/*
	  Start MoL Codeblock - edit.tsx
	*/
	const { shippingMethodsSelection } = useEditorContext();

	// eslint-disable-next-line no-console
	console.log( 1805 );
	// eslint-disable-next-line no-console
	console.log( shippingMethodsSelection );

	const selectedRateId = selectedRate?.rate_id || '';
	const [ selectedOption, setSelectedOption ] = useState( selectedRateId );
	const [ newShippingMethodsSelection, setShippingMethodsSelection ] =
		useState( shippingMethodsSelection );

	const options = {
		value1: {
			value: 'value1',
			label: 'Free Shipping - value1 ',
			disabled: false,
		},
		value2: {
			value: 'value2',
			label: 'Local Pickup - value2',
			disabled: false,
		},
	};

	const optionsArray = Object.values( options ).map( ( option ) => ( {
		...option,
	} ) );
	// eslint-disable-next-line no-console
	console.log( 1810 );

	/*
	  End MoL Codeblock - edit.tsx
	*/

	return (
		<FormStepBlock
			attributes={ attributes }
			setAttributes={ setAttributes }
			className={ classnames(
				'wc-block-checkout__shipping-option',
				attributes?.className
			) }
		>
			<InspectorControls>
				{ globalShippingMethods.length > 0 && (
					<PanelBody
						title={ __(
							'Methods',
							'woo-gutenberg-products-block'
						) }
					>
						<p className="wc-block-checkout__controls-text">
							{ __(
								'The following shipping integrations are active on your store.',
								'woo-gutenberg-products-block'
							) }
						</p>
						{ globalShippingMethods.map( ( method ) => {
							return (
								<>
									<>
										<ExternalLinkCard
											key={ method.id }
											href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping&section=${ method.id }` }
											title={ method.title }
											description={ method.description }
										/>
										<h2>
											Local Pickup delivery information:
										</h2>
										<PlainText
											className={ '' }
											value={
												attributes.localPickupString
											}
											onChange={ ( value ) =>
												setAttributes( {
													localPickupString: value,
												} )
											}
										/>
									</>
								</>
							);
						} ) }
						<ExternalLink
							href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping` }
						>
							{ __(
								'Manage shipping methods',
								'woo-gutenberg-products-block'
							) }
						</ExternalLink>
					</PanelBody>
				) }
				{ activeShippingZones.length && (
					<PanelBody
						title={ __( 'Zones', 'woo-gutenberg-products-block' ) }
					>
						<p className="wc-block-checkout__controls-text">
							{ __(
								'You currently have the following shipping zones active.',
								'woo-gutenberg-products-block'
							) }
						</p>
						{ activeShippingZones.map( ( zone ) => {
							return (
								<ExternalLinkCard
									key={ zone.id }
									href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping&zone_id=${ zone.id }` }
									title={ zone.title }
									description={ zone.description }
								/>
							);
						} ) }
						<ExternalLink
							href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping` }
						>
							{ __(
								'Manage shipping zones',
								'woo-gutenberg-products-block'
							) }
						</ExternalLink>
					</PanelBody>
				) }
			</InspectorControls>
			{ /* <Noninteractive> */ }
			<RadioControl
				selected={ selectedOption }
				onChange={ ( value: string ) => {
					// eslint-disable-next-line no-console
					console.log( value );
					setSelectedOption( value );

					// setRadioAttributes( value );
					// I don't know what onSelectRate does but it doesn't
					// seem to matter for what I am trying to do.
					// onSelectRate( value );
				} }
				// Within this attriubte needs to be the component RadioControlOption
				options={ optionsArray }
			/>
			<p>I am making my own radio component here.</p>

			<h2>Something - 5204</h2>
			{ /* </Noninteractive> */ }
			<AdditionalFields block={ innerBlockAreas.SHIPPING_METHODS } />
		</FormStepBlock>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<AdditionalFieldsContent />
		</div>
	);
};
