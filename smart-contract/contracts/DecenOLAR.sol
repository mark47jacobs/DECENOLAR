pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract DecenOLAR {
    // this will be  used to remove decimal from [lat,long] values
    uint256 private constant RESOLUTION = 10000000000;
    // to store [lat,logn values as pairs
    struct coordinate {
        uint256 lat;
        uint256 long;
    }
    // user details
    struct user {
        address payable userid; // this is the users public key
        uint256 rating;
        bool isDriver;
        string driving_license_number;
        uint256 number_rides;
    }
    //ride details
    struct ride {
        string rideid; // this will be the mongoDB hash
        address payable riderid;
        address payable driverid;
        // source address as string and as [lat,long]
        string source;
        coordinate source_coords;
        // source address as string and as [lat,long]
        string destination;
        coordinate destination_coords;
        uint256 distance; // distance here is in meters
        uint256 cost;
    }

    event userCreated(
        address payable userid, // this is the users public key
        uint256 rating,
        bool isDriver,
        string driving_license_number,
        uint256 number_rides
    );

    event rideFinalized(
        string rideid, // this will be the mongoDB hash
        address payable riderid,
        address payable driverid,
        // source address as string and as [lat,long]
        string source,
        coordinate source_coords,
        // source address as string and as [lat,long]
        string destination,
        coordinate destination_coords,
        uint256 distance, // distance here is in meters
        uint256 cost
    );
    // adress here is the public of the user
    mapping(address => user) public users;

    // key here is the mongoDB object id of the ride that is created.
    mapping(string => ride) public finalizedRides;

    function addUser(bool _isDriver, string memory _driving_license_number)
        public
    {
        require(msg.sender != address(0x0));
        require(_isDriver == true || _isDriver == false);
        require(bytes(_driving_license_number).length > 0);
        users[msg.sender] = user(
            msg.sender,
            5,
            _isDriver,
            _driving_license_number,
            0
        );
    }

    function getUser()
        public
        view
        returns (
            address payable,
            uint256,
            bool,
            string memory,
            uint256
        )
    {
        user memory curUser = users[msg.sender];
        return (
            curUser.userid,
            curUser.rating,
            curUser.isDriver,
            curUser.driving_license_number,
            curUser.number_rides
        );
    }

    function checkUser() public view returns (bool) {
        if (users[msg.sender].userid == msg.sender) return true;
        else return false;
    }

    function finishTransaction(address payable driver) public payable {
        // transact the ride amount
        (driver).transfer(msg.value);
    }

    // method to return the cost in INR based on the standard model for taxi pricing
    // laid by the government of Karnataka.
    function getCalculatedCost(uint256 _distance)
        public
        view
        returns (uint256)
    {
        uint256 retVal = 75 * RESOLUTION;
        if (_distance > 4 * RESOLUTION) {
            retVal += (_distance - 4 * RESOLUTION) * 18;
        }
        return retVal;
    }
}
