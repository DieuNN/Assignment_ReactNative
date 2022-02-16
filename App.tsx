import {
    Alert, Button,
    Dimensions,
    FlatList,
    Image,
    SafeAreaView, ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import React, {useEffect, useState} from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import {NavigationContainer, NavigationHelpers, Route} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {FAB} from "react-native-paper";
import {PermissionsAndroid, Platform} from "react-native";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';


export default function App() {
    let url = 'https://www.flickr.com/services/rest/?method=flickr.favorites.getPublicList&api_key=5f30f8877a137f7cb500122bc7c7a89e&user_id=195012414%40N07&extras=views%2C+media%2C+path_alias%2C+url_sq%2C+url_t%2C+url_s%2C+url_q%2C+url_m%2C+url_n%2C+url_z%2C+url_c%2C+url_l%2C+url_o&format=json&nojsoncallback=1'

    const [data, setData] = useState();

    // const renderItem = ({item}:{item:any}) => (
    //     <View style={{}}>
    //         <TouchableOpacity style={{flexDirection: 'column', alignItems: 'flex-start'}} activeOpacity={0.9}>
    //             <Image source={{uri: item.url_c}} style={styles.images}/>
    //             <View style={{
    //                 position: 'absolute',
    //                 marginLeft: 8,
    //                 bottom: 18,
    //                 backgroundColor: 'rgba(183, 183, 183, 0.4)',
    //                 padding: 3,
    //                 borderRadius: 10
    //             }}>
    //                 <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
    //                     <Icon name={'eye'} style={{marginRight: 8}} color={'white'}/>
    //                     <Text style={{color: 'white'}}>{item.views}</Text>
    //                 </View>
    //             </View>
    //         </TouchableOpacity>
    //     </View>
    // )

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(url).then((result) => result.json()).then((result) => {
                console.log(result)
                setData(result.photos.photo)
            })
        }
        fetchData()
    }, []);


    const HomeScreen = ({navigation}: { navigation: NavigationHelpers<any> }) => (
        <SafeAreaView style={[styles.container, styles.detailScreen]}>
            <StatusBar barStyle={"light-content"}/>
            <FlatList data={data} renderItem={({item}) => (
                <View style={{}}>
                    <TouchableOpacity style={{flexDirection: 'column', alignItems: 'flex-start'}} activeOpacity={0.9}
                                      onPress={() => navigation.navigate('DetailScreen', {
                                          url: item.url_c
                                      })}>
                        <Image source={{uri: item.url_c}} style={styles.images}/>
                        <View style={{
                            position: 'absolute',
                            marginLeft: 8,
                            bottom: 18,
                            backgroundColor: 'rgba(183, 183, 183, 0.4)',
                            padding: 3,
                            borderRadius: 10
                        }}>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                <Icon name={'eye'} style={{marginRight: 8}} color={'white'}/>
                                <Text style={{color: 'white'}}>{item.views}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>)
            } numColumns={2}/>
        </SafeAreaView>
    )

    const DetailScreen = ({route}: { route: Route<any> }) => {
        let imageUrl = route.params.url
        console.log(imageUrl)
        return (
            <SafeAreaView>
                <StatusBar barStyle={"light-content"}/>
                <ScrollView>
                    <Image source={{uri: imageUrl}}
                           style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height}}/>
                    <FAB
                        icon='download'
                        small
                        style={styles.fab}
                        onPress={async () => {
                            let isGranted = false;
                            const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

                            const hasPermission = await PermissionsAndroid.check(permission)
                            if (!hasPermission) {
                                isGranted = await PermissionsAndroid.check(permission);
                            } else {
                                isGranted = true
                            }
                            if (Platform.OS === "android" && !isGranted) {
                                return;
                            }
                            const uri = imageUrl
                            let fileUri = FileSystem.documentDirectory + "image.jpg";
                            FileSystem.downloadAsync(uri, fileUri)
                                .then(({uri}) => {
                                    saveFile(uri);
                                }).then(() => Alert.alert("Download successfully!", " Btw, expo-permission has been deprecated!"))
                                .catch(error => {
                                    console.error(error);
                                    Alert.alert("Error", "You already have this image!")
                                })

                            const saveFile = async (fileUri: string) => {
                                const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
                                if (status === "granted") {
                                    const asset = await MediaLibrary.createAssetAsync(fileUri)
                                    await MediaLibrary.createAlbumAsync("Download", asset, false)
                                }
                            }
                        }}
                    />
                </ScrollView>
            </SafeAreaView>
        )
    }

    const AboutMeScreen = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content"/>
            <Text>Developed by DieuNN PH15766</Text>
            <Text>https://github.com/DieuNN/</Text>
            <Text style={{textAlign: 'center'}}>My Flickr account has been deleted after signed for an API key :(</Text>

        </SafeAreaView>
    )

    const Stack = createNativeStackNavigator()

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={'HomeScreen'} screenOptions={({route, navigation}) => ({
                headerRight: () => (
                    <TouchableOpacity onPress={() => navigation.navigate('AboutMeScreen')}>
                        <Icon name={'bars'}/>
                    </TouchableOpacity>
                )
            })}>
                <Stack.Screen name={'HomeScreen'} component={HomeScreen}
                />
                <Stack.Screen name={'DetailScreen'} component={DetailScreen}/>
                <Stack.Screen name={'AboutMeScreen'} component={AboutMeScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingStart: 8,
        paddingEnd: 8,
        paddingTop: 8
    },
    images: {
        width: Dimensions.get('window').width / 2.3,
        height: 300,
        marginRight: 8,
        marginBottom: 16
    },
    item: {
        backgroundColor: 'green',
        width: 100,
        height: 100
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    detailScreen: {
        padding: 16
    }
});
