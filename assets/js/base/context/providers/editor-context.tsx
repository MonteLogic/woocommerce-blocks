/**
 * External dependencies
 */
import {
	createContext,
	useContext,
	useCallback,
	useState,
} from '@wordpress/element';
import { useSelect } from '@wordpress/data';

interface EditorContextType {
	// Indicates whether in the editor context.
	isEditor: boolean;

	// The post ID being edited.
	currentPostId: number;

	// The current view name, if using a view switcher.
	currentView: string;

	// Object containing preview data for the editor.
	previewData: Record< string, unknown >;

	// String to view the shipping method selection on the edit page.
	shippingMethodSelection: string;

	// Setter function to change the shippingMethodSelection string
	setShippingMethodSelection: ( shippingMethodSelection: string ) => void;

	// Get data by name.
	getPreviewData: ( name: string ) => Record< string, unknown >;
}

const EditorContext = createContext( {
	shippingMethodSelection: '',
	isEditor: false,
	currentPostId: 0,
	currentView: '',
	previewData: {},
	setShippingMethodSelection: () => null,
	getPreviewData: () => ( {} ),
} as EditorContextType );

export const useEditorContext = (): EditorContextType => {
	return useContext( EditorContext );
};

export const EditorProvider = ( {
	shippingMethodSelection = 'value1',
	children,
	currentPostId = 0,
	previewData = {},
	currentView = '',
}: {
	shippingMethodSelection?: string | undefined;
	children: React.ReactChildren;
	currentPostId?: number | undefined;
	previewData?: Record< string, unknown > | undefined;
	currentView?: string | undefined;
} ) => {
	const editingPostId = useSelect(
		( select ): number =>
			currentPostId
				? currentPostId
				: select( 'core/editor' ).getCurrentPostId(),
		[ currentPostId ]
	);
	const getPreviewData = useCallback(
		( name: string ): Record< string, unknown > => {
			if ( previewData && name in previewData ) {
				return previewData[ name ] as Record< string, unknown >;
			}
			return {};
		},
		[ previewData ]
	);

	const [ shippingMethodSelectionValue, setShippingMethodSelectionValue ] =
		useState( shippingMethodSelection );

	const setShippingMethodSelection = useCallback(
		( shippingMethodSelection: string ) => {
			setShippingMethodSelectionValue( shippingMethodSelection );
		},
		[]
	);

	const editorData: EditorContextType = {
		shippingMethodSelection: shippingMethodSelectionValue,
		isEditor: true,
		currentPostId: editingPostId,
		currentView,
		previewData,
		getPreviewData,
		setShippingMethodSelection,
	};

	return (
		<EditorContext.Provider value={ editorData }>
			{ children }
		</EditorContext.Provider>
	);
};
